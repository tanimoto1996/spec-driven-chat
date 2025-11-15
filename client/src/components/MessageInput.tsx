import { useState, KeyboardEvent } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSendMessage: (content: string) => void
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="message-input">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="メッセージを入力... (Enterで送信、Shift+Enterで改行)"
        maxLength={500}
        rows={3}
      />
      <div className="input-footer">
        <span className="char-count">{message.length}/500</span>
        <button onClick={handleSend} disabled={!message.trim()}>
          送信
        </button>
      </div>
    </div>
  )
}

export default MessageInput
