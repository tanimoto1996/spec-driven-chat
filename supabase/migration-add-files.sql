-- メッセージテーブルにファイル情報カラムを追加

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- ファイルサイズの制限（10MB）
ALTER TABLE messages
ADD CONSTRAINT file_size_limit CHECK (file_size IS NULL OR file_size <= 10485760);
