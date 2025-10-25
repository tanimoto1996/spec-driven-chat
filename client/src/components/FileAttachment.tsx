import { formatFileSize, getFileIcon } from '../utils/fileUpload';
import './FileAttachment.css';

interface FileAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

const FileAttachment = ({ fileUrl, fileName, fileSize, fileType }: FileAttachmentProps) => {
  const isImage = fileType.startsWith('image/');

  return (
    <div className="file-attachment">
      {isImage ? (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-image-link">
          <img src={fileUrl} alt={fileName} className="file-image" />
        </a>
      ) : (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-download-link">
          <span className="file-icon">{getFileIcon(fileType)}</span>
          <div className="file-info">
            <div className="file-name">{fileName}</div>
            <div className="file-size">{formatFileSize(fileSize)}</div>
          </div>
          <span className="download-icon">⬇️</span>
        </a>
      )}
    </div>
  );
};

export default FileAttachment;
