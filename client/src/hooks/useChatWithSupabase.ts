import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { Message } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useChatWithSupabase = (username: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!username) return;

    let realtimeChannel: RealtimeChannel;

    const setupChat = async () => {
      try {
        // 過去のメッセージを取得（最新50件）
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        // メッセージを変換
        const formattedMessages: Message[] = (data || []).map(msg => ({
          id: msg.id,
          username: msg.username,
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime()
        }));

        setMessages(formattedMessages);

        // Realtimeチャンネルを設定
        realtimeChannel = supabase.channel('public:messages');

        // 新しいメッセージのリスニング
        realtimeChannel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              const newMessage: Message = {
                id: payload.new.id,
                username: payload.new.username,
                content: payload.new.content,
                timestamp: new Date(payload.new.created_at).getTime()
              };
              setMessages(prev => [...prev, newMessage]);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              console.log('Supabase Realtime connected');
            }
          });

        setChannel(realtimeChannel);

        // プレゼンス機能でオンラインユーザー数を追跡
        const presenceChannel = supabase.channel('online-users', {
          config: {
            presence: {
              key: username
            }
          }
        });

        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            setUserCount(Object.keys(state).length);
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('User joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('User left:', leftPresences);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track({
                user: username,
                online_at: new Date().toISOString()
              });
            }
          });

      } catch (err) {
        console.error('Failed to setup chat:', err);
        setError('チャットの初期化に失敗しました');
        setIsConnected(false);
      }
    };

    setupChat();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [username]);

  const sendMessage = useCallback(async (content: string) => {
    if (!username || !content.trim()) return;

    // クライアント側バリデーション
    if (content.length > 500) {
      setError('メッセージは500文字以内で入力してください');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          username,
          content: content.trim()
        });

      if (insertError) throw insertError;

      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('メッセージの送信に失敗しました');
    }
  }, [username]);

  return {
    messages,
    userCount,
    isConnected,
    error,
    sendMessage
  };
};
