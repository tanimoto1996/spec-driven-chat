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
        <h1>チャットアプリ</h1>
        <div className="header-info">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '接続中' : '切断'}
          </span>
          <span className="user-count">
            オンライン: {userCount}
          </span>
          <button className="leave-button" onClick={onLeave}>
            退室
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
