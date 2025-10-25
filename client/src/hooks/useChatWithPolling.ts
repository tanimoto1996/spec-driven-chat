import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import type { Message } from '../types';

const POLL_INTERVAL = 2000; // 2秒ごとにポーリング

export const useChatWithPolling = (username: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // メッセージを取得
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        username: msg.username,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        file_url: msg.file_url,
        file_name: msg.file_name,
        file_size: msg.file_size,
        file_type: msg.file_type
      }));

      setMessages(formattedMessages);
      setIsConnected(true);

      // 最新のメッセージIDを保存
      if (formattedMessages.length > 0) {
        lastMessageIdRef.current = formattedMessages[formattedMessages.length - 1].id;
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('メッセージの取得に失敗しました');
      setIsConnected(false);
    }
  }, []);

  // 新しいメッセージのみを取得
  const fetchNewMessages = useCallback(async () => {
    if (!lastMessageIdRef.current) {
      await fetchMessages();
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        username: msg.username,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        file_url: msg.file_url,
        file_name: msg.file_name,
        file_size: msg.file_size,
        file_type: msg.file_type
      }));

      // 最新のメッセージIDより後のメッセージを追加
      const lastIndex = formattedMessages.findIndex(
        msg => msg.id === lastMessageIdRef.current
      );

      if (lastIndex !== -1 && lastIndex < formattedMessages.length - 1) {
        const newMessages = formattedMessages.slice(lastIndex + 1);
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
        }
      } else if (lastIndex === -1) {
        // 全てのメッセージを再取得
        setMessages(formattedMessages);
        if (formattedMessages.length > 0) {
          lastMessageIdRef.current = formattedMessages[formattedMessages.length - 1].id;
        }
      }

      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch new messages:', err);
      setIsConnected(false);
    }
  }, [fetchMessages]);

  // 初回ロードとポーリング
  useEffect(() => {
    if (!username) return;

    // 初回メッセージ取得
    fetchMessages();

    // ポーリング開始
    pollIntervalRef.current = setInterval(() => {
      fetchNewMessages();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [username, fetchMessages, fetchNewMessages]);

  const sendMessage = useCallback(async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string
  ) => {
    if (!username) return;
    if (!content.trim() && !fileUrl) return;

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
          content: content.trim() || (fileUrl ? '' : ''),
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType
        });

      if (insertError) throw insertError;

      // 送信後すぐに新しいメッセージを取得
      setTimeout(() => {
        fetchNewMessages();
      }, 500);

      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('メッセージの送信に失敗しました');
    }
  }, [username, fetchNewMessages]);

  // オンラインユーザー数は固定（Realtimeなしでは追跡困難）
  const userCount = 1;

  return {
    messages,
    userCount,
    isConnected,
    error,
    sendMessage
  };
};
