import { useState, KeyboardEvent, useRef } from 'react';
import { uploadFile, formatFileSize } from '../utils/fileUpload';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string
  ) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileType: string | undefined;

      // ファイルがある場合はアップロード
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = uploaded.name;
        fileSize = uploaded.size;
        fileType = uploaded.type;
      }

      // メッセージ送信
      onSendMessage(message, fileUrl, fileName, fileSize, fileType);

      // リセット
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Send error:', error);
      setUploadError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      {selectedFile && (
        <div className="selected-file">
          <span className="file-info">
            📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </span>
          <button
            type="button"
            className="remove-file-button"
            onClick={handleRemoveFile}
            disabled={isUploading}
          >
            ✕
          </button>
        </div>
      )}

      {uploadError && (
        <div className="upload-error">
          ⚠️ {uploadError}
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="メッセージを入力... (Enterで送信、Shift+Enterで改行)"
        maxLength={500}
        rows={3}
        disabled={isUploading}
      />

      <div className="input-footer">
        <div className="left-controls">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
            disabled={isUploading}
          />
          <button
            type="button"
            className="file-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="ファイルを添付"
          >
            📎
          </button>
          <span className="char-count">{message.length}/500</span>
        </div>
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="send-button"
        >
          {isUploading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
