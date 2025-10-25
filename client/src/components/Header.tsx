import './Header.css'

interface HeaderProps {
  userCount: number
  isConnected: boolean
  onLeave: () => void
}

const Header = ({ userCount, isConnected, onLeave }: HeaderProps) => {
  return (
    <header className="chat-header">
      <div className="header-content">
        <div className="header-left">
          <div className="app-icon">💬</div>
          <div className="app-title-group">
            <h1>Chat App</h1>
            <p className="app-subtitle">リアルタイムチャット</p>
          </div>
        </div>
        <div className="header-right">
          <div className="status-group">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {isConnected ? '接続中' : '切断'}
            </span>
            <span className="user-count">
              <span className="user-icon">👥</span>
              {userCount} 人
            </span>
          </div>
          <button className="leave-button" onClick={onLeave}>
            <span className="button-icon">🚪</span>
            退室
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
