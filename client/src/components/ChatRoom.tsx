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

      <MessageInput onSendMessage={sendMessage} />
    </div>
  )
}

export default ChatRoom
