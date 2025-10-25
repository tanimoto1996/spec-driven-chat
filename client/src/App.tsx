import { useState } from 'react'
import LoginForm from './components/LoginForm'
import ChatRoom from './components/ChatRoom'
import './App.css'

function App() {
  const [username, setUsername] = useState<string | null>(null)

  const handleJoin = (name: string) => {
    setUsername(name)
  }

  const handleLeave = () => {
    setUsername(null)
  }

  return (
    <div className="app">
      {username ? (
        <ChatRoom username={username} onLeave={handleLeave} />
      ) : (
        <LoginForm onJoin={handleJoin} />
      )}
    </div>
  )
}

export default App
