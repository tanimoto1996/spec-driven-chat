import { useState, FormEvent } from 'react'
import './LoginForm.css'

interface LoginFormProps {
  onJoin: (username: string, displayName: string) => void
}

const LoginForm = ({ onJoin }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      })

      const data = await response.json()

      if (data.success) {
        setError('')
        onJoin(data.user.id, data.user.displayName)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('ログインに失敗しました。サーバーに接続できません。')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>チャットアプリへようこそ</h1>
        <p className="subtitle">ユーザー名を入力してチャットに参加しましょう</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">ユーザーID</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kikuno, oosima など"
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
              placeholder="パスワード"
            />
          </div>

          {error && <span className="error-text">{error}</span>}

          <button type="submit" className="join-button">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
