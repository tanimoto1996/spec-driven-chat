import type { Message } from '../types'
import FileAttachment from './FileAttachment'
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
          <span className="username">{message.username}</span>
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </div>
      )}
      <div className="message-content">
        {message.content && <div>{message.content}</div>}
        {message.file_url && message.file_name && message.file_size && message.file_type && (
          <FileAttachment
            fileUrl={message.file_url}
            fileName={message.file_name}
            fileSize={message.file_size}
            fileType={message.file_type}
          />
        )}
      </div>
    </div>
  )
}

export default MessageItem
