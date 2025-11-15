import { useState } from 'react'
import LoginForm from './components/LoginForm'
import ChatRoom from './components/ChatRoom'
import './App.css'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  const handleJoin = (name: string, display: string) => {
    setUsername(name)
    setDisplayName(display)
  }

  const handleLeave = () => {
    setUsername(null)
    setDisplayName(null)
  }

  return (
    <div className="app">
      {username && displayName ? (
        <ChatRoom username={username} displayName={displayName} onLeave={handleLeave} />
      ) : (
        <LoginForm onJoin={handleJoin} />
      )}
    </div>
  )
}

export default App
