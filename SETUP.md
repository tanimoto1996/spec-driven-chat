# セットアップガイド

このガイドでは、開発環境のセットアップ手順を詳しく説明します。

## 目次

1. [前提条件](#前提条件)
2. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
3. [Supabaseのセットアップ](#supabaseのセットアップ)
4. [環境変数の設定](#環境変数の設定)
5. [開発サーバーの起動](#開発サーバーの起動)
6. [トラブルシューティング](#トラブルシューティング)

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js**: v18.0.0 以上
- **npm**: v9.0.0 以上（Node.jsに付属）
- **Git**: 最新版

### インストール確認

```bash
node --version  # v18.0.0以上
npm --version   # v9.0.0以上
git --version   # 最新版
```

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/tanimoto1996/spec-driven-chat.git
cd spec-driven-chat
```

### 2. 依存関係のインストール

```bash
cd client
npm install
```

インストールされる主な依存関係：
- `react` - UIライブラリ
- `@supabase/supabase-js` - Supabaseクライアント
- `typescript` - TypeScript
- `vite` - ビルドツール

## Supabaseのセットアップ

### 1. Supabaseアカウントの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ

### 2. 新規プロジェクトの作成

1. 「New Project」をクリック
2. 以下を入力：
   - **Name**: `chat-app`（任意）
   - **Database Password**: 強力なパスワード（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` 推奨
3. 「Create new project」をクリック
4. プロジェクトの準備が完了するまで待機（約2分）

### 3. データベースのセットアップ

#### 3-1. SQL Editorを開く

1. 左サイドバーの「SQL Editor」をクリック
2. 「New query」をクリック

#### 3-2. テーブルの作成

以下のSQLをコピー＆ペーストして「Run」をクリック：

```sql
-- usersテーブル作成
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL
);

-- messagesテーブル作成
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  content TEXT,  -- NULL許可（ファイルのみ送信可能にするため）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_stamp BOOLEAN DEFAULT false
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_username ON messages(username);
```

#### 3-3. サンプルユーザーの追加

```sql
INSERT INTO users (id, password, display_name) VALUES
  ('kikuno', 'mamiya', '菊野'),
  ('oosima', 'mamiya', '大嶋'),
  ('nakamura', 'mamiya', '中村'),
  ('komiyama', 'mamiya', '小宮山'),
  ('tanimoto', 'mamiya', '谷本'),
  ('rosyan', 'mamiya', 'ロシャン');
```

### 4. Storageのセットアップ

#### 4-1. バケットの作成

1. 左サイドバーの「Storage」をクリック
2. 「New bucket」をクリック
3. 以下を入力：
   - **Name**: `chat-files`
   - **Public bucket**: ✅ ON（重要！）
4. 「Create bucket」をクリック

#### 4-2. バケットの確認

SQL Editorで以下を実行して確認：

```sql
SELECT * FROM storage.buckets WHERE id = 'chat-files';
```

`public`カラムが`true`であることを確認してください。

### 5. API認証情報の取得

1. 左サイドバーの「Project Settings」（歯車アイコン）をクリック
2. 「API」セクションを選択
3. 以下をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`（長いトークン）

この2つの値は次のステップで使用します。

## 環境変数の設定

### 1. .envファイルの作成

```bash
cd client
cp .env.example .env
```

### 2. .envファイルの編集

`.env`ファイルを開いて、Supabaseで取得した値を設定：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...（長いトークン）
```

**注意事項**:
- `.env`ファイルは`.gitignore`に含まれており、Gitにコミットされません
- 本番環境では別途環境変数を設定する必要があります

## 開発サーバーの起動

### 1. 開発サーバーの起動

```bash
cd client
npm run dev
```

以下のように表示されれば成功です：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 2. アプリケーションへのアクセス

ブラウザで http://localhost:5173 を開きます。

### 3. ログインテスト

以下のユーザーでログインできることを確認：

- **ユーザーID**: `kikuno`
- **パスワード**: `mamiya`

## トラブルシューティング

### npm installエラー

#### エラー: `EACCES: permission denied`

**解決策**:
```bash
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

#### エラー: `ERESOLVE unable to resolve dependency tree`

**解決策**:
```bash
npm install --legacy-peer-deps
```

### Supabase接続エラー

#### エラー: `Failed to fetch`

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. `.env`ファイルの内容を確認
2. `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`が正しいか確認
3. 開発サーバーを再起動（Ctrl+C → `npm run dev`）

#### エラー: `relation "messages" does not exist`

**原因**: テーブルが作成されていない

**解決策**:
1. Supabase SQL Editorを開く
2. テーブル作成SQLを再実行

### ログインエラー

#### エラー: `ユーザー名またはパスワードが正しくありません`

**解決策**:
1. Supabase Table Editorで`users`テーブルを確認
2. ユーザーが存在するか確認
3. パスワードが`mamiya`であることを確認

### ファイルアップロードエラー

#### エラー: `ファイルのアップロードに失敗しました`

**原因1**: `chat-files`バケットが存在しない

**解決策**:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true);
```

**原因2**: バケットがpublicでない

**解決策**:
```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'chat-files';
```

### スタンプ送信エラー

#### エラー: `Could not find the 'is_stamp' column`

**原因**: `is_stamp`カラムが存在しない

**解決策**:
```sql
ALTER TABLE messages
ADD COLUMN is_stamp BOOLEAN DEFAULT false;
```

### 画像のみ送信エラー

#### エラー: `null value in column "content" violates not-null constraint`

**原因**: `content`カラムがNOT NULL制約を持っている

**解決策**:
```sql
ALTER TABLE messages
ALTER COLUMN content DROP NOT NULL;
```

## 開発のヒント

### ホットリロード

Viteは自動的にファイル変更を検知して再読み込みします。変更を保存するだけでブラウザに反映されます。

### TypeScriptエラーの確認

```bash
npm run type-check
```

### ビルドテスト

本番ビルドをテスト：

```bash
npm run build
npm run preview
```

### Supabaseのログ確認

Supabase Dashboard > Logs で以下を確認できます：
- データベースクエリ
- Realtime接続
- Storage操作

### ローカルでのSupabase開発

より高度な開発には、Supabase CLIを使用したローカル開発環境も利用可能です：

```bash
# Supabase CLIのインストール
npm install -g supabase

# ローカル環境の起動
supabase start

# マイグレーションの作成
supabase migration new create_tables
```

詳細は [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development) を参照してください。

## 次のステップ

セットアップが完了したら：

1. [README.md](./README.md) でアプリケーション機能を確認
2. [ARCHITECTURE.md](./ARCHITECTURE.md) でシステム構成を理解
3. [DEPLOYMENT.md](./DEPLOYMENT.md) でデプロイ方法を学習

## サポート

問題が解決しない場合は、[GitHub Issues](https://github.com/tanimoto1996/spec-driven-chat/issues)で質問してください。
