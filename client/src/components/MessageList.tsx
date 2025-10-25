import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageItem from './MessageItem'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  currentUsername: string
}

const MessageList = ({ messages, currentUsername }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // メッセージが更新されたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          メッセージはまだありません。最初のメッセージを送信してみましょう！
        </div>
      ) : (
        messages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.username === currentUsername}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
