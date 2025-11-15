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

  return (
    <div className="chat-room">
      <Header onLeave={onLeave} />

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
