# Supabaseセットアップガイド

## 1. Supabaseプロジェクトの作成

1. **Supabaseにアクセス**
   - https://supabase.com にアクセス
   - GitHubアカウントでサインアップ/ログイン

2. **新規プロジェクトを作成**
   - 「New Project」をクリック
   - プロジェクト名: `spec-driven-chat`
   - データベースパスワード: 強力なパスワードを設定（メモしておく）
   - リージョン: `Northeast Asia (Tokyo)` を選択
   - 「Create new project」をクリック

3. **プロジェクトの準備完了を待つ**（数分かかります）

## 2. データベーススキーマの適用

1. **SQL Editorを開く**
   - 左サイドバーの「SQL Editor」をクリック

2. **スキーマを実行**
   - `supabase/schema.sql` の内容をコピー
   - SQL Editorに貼り付け
   - 「Run」をクリック

3. **テーブルの確認**
   - 「Table Editor」で `messages` テーブルが作成されていることを確認

## 3. API認証情報の取得

1. **Settings → API** にアクセス

2. **以下の情報をコピー**
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（サーバー側のみ使用）
   ```

## 4. 環境変数の設定

### サーバー側（Render/Railway）

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（service_role key）
```

### クライアント側（Vercel）

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（anon public key）
```

## 5. リアルタイム機能の有効化

1. **Database → Replication** にアクセス

2. **`messages` テーブルのReplicationを有効化**
   - 0 tables を探す
   - `messages` テーブルの Replication を ON にする

## 6. 動作確認

SQL Editorで以下を実行してテスト：

```sql
-- テストデータを挿入
INSERT INTO messages (username, content)
VALUES ('Test User', 'Hello, Supabase!');

-- データを確認
SELECT * FROM messages ORDER BY created_at DESC;
```

## トラブルシューティング

### RLSエラーが出る場合

Row Level Security (RLS) が原因の場合：

```sql
-- 一時的にRLSを無効化（開発時のみ）
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

### リアルタイム機能が動作しない場合

1. Database → Replication で `messages` テーブルが有効か確認
2. プロジェクトの再起動を試す

## セキュリティ考慮事項

- `anon public key` はクライアント側で使用（公開OK）
- `service_role key` はサーバー側のみで使用（絶対に公開しない）
- 本番環境では適切なRLSポリシーを設定
