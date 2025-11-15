import { useState, KeyboardEvent, useRef } from 'react'
import StampPicker from './StampPicker'
import './MessageInput.css'

interface MessageInputProps {
  onSendMessage: (content: string, file?: File, isStamp?: boolean) => void
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showStampPicker, setShowStampPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile || undefined)
      setMessage('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください')
        return
      }

      // ファイル形式チェック
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-powerpoint' // .ppt
      ]

      if (!allowedTypes.includes(file.type)) {
        alert('対応していないファイル形式です。\n画像、Word、Excel、PowerPointのファイルを選択してください。')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStampSelect = (emoji: string) => {
    onSendMessage(emoji, undefined, true)
  }

  return (
    <div className="message-input">
      {selectedFile && (
        <div className="selected-file">
          <span className="file-name">📎 {selectedFile.name}</span>
          <button type="button" className="remove-file-btn" onClick={handleRemoveFile}>
            ×
          </button>
        </div>
      )}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="メッセージを入力... (Enterで送信、Shift+Enterで改行)"
        maxLength={500}
        rows={3}
      />
      <div className="input-footer">
        <div className="left-actions">
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            accept=".jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="file-button">
            📎 ファイル
          </label>
          <button
            type="button"
            className="file-button"
            onClick={() => setShowStampPicker(true)}
          >
            😊 スタンプ
          </button>
          <span className="char-count">{message.length}/500</span>
        </div>
        <button onClick={handleSend} disabled={!message.trim() && !selectedFile}>
          送信
        </button>
      </div>
      {showStampPicker && (
        <StampPicker
          onSelect={handleStampSelect}
          onClose={() => setShowStampPicker(false)}
        />
      )}
    </div>
  )
}

export default MessageInput
