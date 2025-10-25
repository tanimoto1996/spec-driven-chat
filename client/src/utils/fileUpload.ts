import { supabase } from '../config/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  // 画像
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // ドキュメント
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // テキスト
  'text/plain',
  'text/csv',
  // アーカイブ
  'application/zip',
  'application/x-zip-compressed',
];

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ファイルサイズは10MB以下にしてください');
  }

  // ファイルタイプチェック
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('このファイル形式はサポートされていません');
  }

  // ユニークなファイル名を生成
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${extension}`;

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('ファイルのアップロードに失敗しました');
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('chat-files')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
    type: file.type
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('zip')) return '📦';
  if (fileType.startsWith('text/')) return '📃';
  return '📎';
};
