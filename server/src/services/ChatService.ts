import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type { Message, User, JoinRequest, SendMessageRequest } from '../types';
import { validateUsername, validateMessageContent, sanitizeText } from '../utils/validation';
import { supabase } from '../config/supabase';

export class ChatService {
  private users: Map<string, User> = new Map();

  constructor(private io: Server) {}

  // メッセージ履歴を取得（最新50件）
  private async getRecentMessages(): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).reverse().map(msg => ({
        id: msg.id,
        username: msg.username,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime()
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  // メッセージをデータベースに保存
  private async saveMessage(message: Message): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          username: message.username,
          content: message.content,
          created_at: new Date(message.timestamp).toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  handleConnection(socket: Socket) {
    console.log(`新しい接続: ${socket.id}`);

    // 参加イベント
    socket.on('join', (data: JoinRequest) => {
      this.handleJoin(socket, data);
    });

    // メッセージ送信イベント
    socket.on('sendMessage', (data: SendMessageRequest) => {
      this.handleSendMessage(socket, data);
    });

    // 切断イベント
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  private async handleJoin(socket: Socket, data: JoinRequest) {
    const error = validateUsername(data.username);
    if (error) {
      socket.emit('error', { message: error });
      return;
    }

    const username = sanitizeText(data.username.trim());

    const user: User = {
      id: socket.id,
      username,
      joinedAt: Date.now()
    };

    this.users.set(socket.id, user);

    // 過去のメッセージを送信
    const recentMessages = await this.getRecentMessages();
    socket.emit('messageHistory', recentMessages);

    // 他のユーザーに参加通知
    socket.broadcast.emit('userJoined', { username });

    // 全員にユーザー数を通知
    this.io.emit('userCount', { count: this.users.size });

    console.log(`${username} が参加しました (合計: ${this.users.size}人)`);
  }

  private async handleSendMessage(socket: Socket, data: SendMessageRequest) {
    const user = this.users.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'チャットに参加していません' });
      return;
    }

    const error = validateMessageContent(data.content);
    if (error) {
      socket.emit('error', { message: error });
      return;
    }

    const content = sanitizeText(data.content.trim());

    const message: Message = {
      id: uuidv4(),
      username: user.username,
      content,
      timestamp: Date.now()
    };

    // データベースに保存
    await this.saveMessage(message);

    // 全員にメッセージをブロードキャスト
    this.io.emit('message', message);

    console.log(`${user.username}: ${content}`);
  }

  private handleDisconnect(socket: Socket) {
    const user = this.users.get(socket.id);
    if (user) {
      this.users.delete(socket.id);

      // 他のユーザーに退室通知
      socket.broadcast.emit('userLeft', { username: user.username });

      // 全員にユーザー数を通知
      this.io.emit('userCount', { count: this.users.size });

      console.log(`${user.username} が退室しました (残り: ${this.users.size}人)`);
    }
  }

  getUserCount(): number {
    return this.users.size;
  }
}
