import './Header.css'

interface HeaderProps {
  onLeave: () => void
}

const Header = ({ onLeave }: HeaderProps) => {
  return (
    <header className="chat-header">
      <div className="header-content">
        <h1>俺俺チャット</h1>
        <button className="leave-button" onClick={onLeave}>
          ←
        </button>
      </div>
    </header>
  )
}

export default Header
