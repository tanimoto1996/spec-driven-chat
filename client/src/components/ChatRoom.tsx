import { useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import Header from './Header'
import './ChatRoom.css'

interface ChatRoomProps {
  username: string
  displayName: string
  onLeave: () => void
}

const ChatRoom = ({ username, displayName, onLeave }: ChatRoomProps) => {
  const { messages, error, sendMessage } = useChat(username, displayName)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-room">
      <Header onLeave={onLeave} />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <MessageList messages={messages} currentUsername={username} />
      <div ref={messagesEndRef} />

      <MessageInput onSendMessage={sendMessage} />
    </div>
  )
}

export default ChatRoom
