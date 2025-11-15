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
          username: msg.username,
          displayName: msg.display_name,
          content: msg.content || '',
          timestamp: new Date(msg.created_at).getTime(),
          fileUrl: msg.file_url,
          fileName: msg.file_name,
          fileSize: msg.file_size,
          fileType: msg.file_type,
          isStamp: msg.is_stamp || false
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
            username: payload.new.username,
            displayName: payload.new.display_name,
            content: payload.new.content || '',
            timestamp: new Date(payload.new.created_at).getTime(),
            fileUrl: payload.new.file_url,
            fileName: payload.new.file_name,
            fileSize: payload.new.file_size,
            fileType: payload.new.file_type,
            isStamp: payload.new.is_stamp || false
          }
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [username, displayName])

  const sendMessage = useCallback(async (content: string, file?: File, isStamp?: boolean) => {
    if (!username || !displayName || (!content.trim() && !file)) return

    // クライアント側バリデーション
    if (content.length > 500 && !isStamp) {
      setError('メッセージは500文字以内で入力してください')
      return
    }

    let fileUrl = null
    let fileName = null
    let fileSize = null
    let fileType = null

    // ファイルがある場合、Supabase Storageにアップロード
    if (file) {
      const fileExt = file.name.split('.').pop()
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        setError('ファイルのアップロードに失敗しました')
        console.error('アップロードエラー:', uploadError)
        return
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      fileUrl = publicUrl
      fileName = file.name
      fileSize = file.size
      fileType = file.type
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        username: username,
        display_name: displayName,
        content: content.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        is_stamp: isStamp || false
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
