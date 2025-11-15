import './StampPicker.css'

interface StampPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const STAMPS = [
  '👍', '❤️', '😊', '😂', '🎉',
  '👏', '🙏', '💯', '🔥', '✨',
  '😭', '😍', '🤔', '😅', '🥺',
  '💪', '🎊', '👌', '🙌', '💕'
]

const StampPicker = ({ onSelect, onClose }: StampPickerProps) => {
  const handleSelect = (emoji: string) => {
    onSelect(emoji)
    onClose()
  }

  return (
    <>
      <div className="stamp-picker-overlay" onClick={onClose} />
      <div className="stamp-picker">
        <div className="stamp-picker-header">
          <span>スタンプを選択</span>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="stamp-grid">
          {STAMPS.map((emoji, index) => (
            <button
              key={index}
              className="stamp-button"
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default StampPicker
