import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', username.trim())
        .eq('password', password)
        .single()

      if (error || !data) {
        setError('ユーザー名またはパスワードが正しくありません')
        return
      }

      setError('')
      onJoin(data.id, data.display_name)
    } catch (error) {
      setError('ログインに失敗しました')
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
