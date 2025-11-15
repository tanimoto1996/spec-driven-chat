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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const isImage = (fileType?: string) => {
    return fileType?.startsWith('image/')
  }

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('word')) return '📄'
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊'
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊'
    return '📎'
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
        {message.content && <div className="text-content">{message.content}</div>}
        {message.fileUrl && (
          <div className="file-attachment">
            {isImage(message.fileType) ? (
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                <img src={message.fileUrl} alt={message.fileName} className="image-preview" />
              </a>
            ) : (
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                <span className="file-icon">{getFileIcon(message.fileType)}</span>
                <div className="file-info">
                  <div className="file-name-display">{message.fileName}</div>
                  {message.fileSize && (
                    <div className="file-size-display">{formatFileSize(message.fileSize)}</div>
                  )}
                </div>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem
