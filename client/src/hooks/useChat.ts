import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Message, UserNotification, UserCountUpdate, ErrorResponse } from '../types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useChat = (username: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return

    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // 接続イベント
    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join', { username })
    })

    // メッセージ履歴受信
    newSocket.on('messageHistory', (history: Message[]) => {
      setMessages(history)
    })

    // メッセージ受信
    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // ユーザー参加通知
    newSocket.on('userJoined', (data: UserNotification) => {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        username: 'System',
        content: `${data.username} が参加しました`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, systemMessage])
    })

    // ユーザー退室通知
    newSocket.on('userLeft', (data: UserNotification) => {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        username: 'System',
        content: `${data.username} が退室しました`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, systemMessage])
    })

    // オンラインユーザー数更新
    newSocket.on('userCount', (data: UserCountUpdate) => {
      setUserCount(data.count)
    })

    // エラー処理
    newSocket.on('error', (data: ErrorResponse) => {
      setError(data.message)
    })

    // 切断イベント
    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      newSocket.close()
    }
  }, [username])

  const sendMessage = useCallback((content: string) => {
    if (!socket || !content.trim()) return

    // クライアント側バリデーション
    if (content.length > 500) {
      setError('メッセージは500文字以内で入力してください')
      return
    }

    socket.emit('sendMessage', { content })
    setError(null)
  }, [socket])

  return {
    messages,
    userCount,
    isConnected,
    error,
    sendMessage
  }
}
