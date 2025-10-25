-- チャットアプリケーションのデータベーススキーマ

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT content_length CHECK (char_length(content) <= 500),
  CONSTRAINT username_length CHECK (char_length(username) <= 20)
);

-- インデックス（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Everyone can read messages" ON messages
  FOR SELECT USING (true);

-- 全員が挿入可能（認証機能追加時に変更）
CREATE POLICY "Everyone can insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- 古いメッセージの自動削除（オプション：7日より古いメッセージを削除）
-- CREATE OR REPLACE FUNCTION delete_old_messages()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM messages WHERE created_at < NOW() - INTERVAL '7 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- リアルタイム機能を有効化（Supabaseのリアルタイム機能を使用）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
