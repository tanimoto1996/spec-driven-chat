import { useRef, useEffect } from 'react'
import type { Message } from '../types'
import MessageItem from './MessageItem'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  currentUsername: string
}

const MessageList = ({ messages, currentUsername }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // メッセージが変わったら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ユーザー名を正規化して比較（空白を削除、小文字化）
  const normalizeUsername = (username: string) => {
    return username.trim().toLowerCase()
  }

  const normalizedCurrentUsername = normalizeUsername(currentUsername)

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          メッセージはまだありません。最初のメッセージを送信してみましょう！
        </div>
      ) : (
        <>
          {messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={normalizeUsername(message.username) === normalizedCurrentUsername}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}

export default MessageList
