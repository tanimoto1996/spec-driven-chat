import { useRef, useEffect } from 'react'
import { useChatWithPolling } from '../hooks/useChatWithPolling'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import Header from './Header'
import './ChatRoom.css'

interface ChatRoomProps {
  username: string
  onLeave: () => void
}

const ChatRoom = ({ username, onLeave }: ChatRoomProps) => {
  const { messages, userCount, isConnected, error, sendMessage } = useChatWithPolling(username)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-room">
      <Header
        userCount={userCount}
        isConnected={isConnected}
        onLeave={onLeave}
      />

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
