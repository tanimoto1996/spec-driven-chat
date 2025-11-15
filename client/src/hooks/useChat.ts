import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

export const useChat = (username: string | null, displayName: string | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username || !displayName) return

    // 既存メッセージを取得
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('メッセージ取得エラー:', error)
        return
      }

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          username: msg.ユーザー名,
          displayName: msg.display_name,
          content: msg.コンテンツ,
          timestamp: new Date(msg.作成日時).getTime()
        })))
      }
    }

    fetchMessages()

    // Realtimeサブスクリプション
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            username: payload.new.ユーザー名,
            displayName: payload.new.display_name,
            content: payload.new.コンテンツ,
            timestamp: new Date(payload.new.作成日時).getTime()
          }
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [username, displayName])

  const sendMessage = useCallback(async (content: string) => {
    if (!username || !displayName || !content.trim()) return

    // クライアント側バリデーション
    if (content.length > 500) {
      setError('メッセージは500文字以内で入力してください')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        ユーザー名: username,
        display_name: displayName,
        コンテンツ: content.trim()
      })

    if (error) {
      setError('メッセージの送信に失敗しました')
      console.error('送信エラー:', error)
    } else {
      setError(null)
    }
  }, [username, displayName])

  return {
    messages,
    error,
    sendMessage
  }
}
