import { useState, FormEvent } from 'react'
import './LoginForm.css'

interface LoginFormProps {
  onJoin: (username: string) => void
}

const LoginForm = ({ onJoin }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError('ユーザー名を入力してください')
      return
    }

    if (username.length > 20) {
      setError('ユーザー名は20文字以内で入力してください')
      return
    }

    if (!password) {
      setError('パスワードを入力してください')
      return
    }

    if (password !== 'mamiya') {
      setError('パスワードが正しくありません')
      return
    }

    setError('')
    onJoin(username.trim())
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>チャットアプリへようこそ</h1>
        <p className="subtitle">ユーザー名とパスワードを入力してチャットに参加しましょう</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="1-20文字で入力"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="join-button">
            参加する
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
