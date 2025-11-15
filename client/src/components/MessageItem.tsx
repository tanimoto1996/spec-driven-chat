import type { Message } from '../types'
import './MessageItem.css'

interface MessageItemProps {
  message: Message
  isOwnMessage: boolean
}

const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const isSystemMessage = message.username === 'System'

  return (
    <div className={`message-item ${isOwnMessage ? 'own' : 'other'} ${isSystemMessage ? 'system' : ''}`}>
      {!isSystemMessage && (
        <div className="message-header">
          <span className="username">{message.displayName || message.username}</span>
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </div>
      )}
      <div className="message-content">
        {message.content}
      </div>
    </div>
  )
}

export default MessageItem
