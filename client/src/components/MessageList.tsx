import type { Message } from '../types'
import MessageItem from './MessageItem'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  currentUsername: string
}

const MessageList = ({ messages, currentUsername }: MessageListProps) => {
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
    </div>
  )
}

export default MessageList
