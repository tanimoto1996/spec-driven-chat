# 風土チャット - リアルタイムチャットアプリケーション

Supabase × React で構築されたLINE風チャットアプリケーション

## 概要

このプロジェクトは、Supabaseをバックエンドとして使用したリアルタイムチャットアプリケーションです。サーバーレスアーキテクチャで、シンプルかつモダンなチャット体験を提供します。

## 主な機能

### コア機能
- ✅ **リアルタイムメッセージング** - Supabase Realtimeによる即座のメッセージ配信
- ✅ **ユーザー認証** - Supabaseデータベースによる認証
- ✅ **ファイル共有** - 画像、Word、Excel、PowerPointの添付
- ✅ **スタンプ機能** - 20種類の絵文字スタンプ
- ✅ **自動スクロール** - 最新メッセージへの自動スクロール

### UI/UX
- ✅ **LINE風デザイン** - 使い慣れたインターフェース
- ✅ **レスポンシブ対応** - PC・スマホ両対応
- ✅ **表示名対応** - ユーザーIDと表示名の使い分け
- ✅ **画像プレビュー** - 画像の即座プレビュー表示

### 運用機能
- ✅ **自動デプロイ** - Vercelによる自動デプロイ
- ✅ **CI/CD** - GitHub Actionsによる自動ビルド
- ✅ **Keep-Alive** - Supabase自動停止防止

## 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **CSS3** - スタイリング（LINE風デザイン）

### バックエンド（Serverless）
- **Supabase** - BaaS（Database + Realtime + Storage）
  - PostgreSQL - リレーショナルデータベース
  - Realtime - WebSocketベースのリアルタイム通信
  - Storage - ファイルストレージ

### インフラ
- **Vercel** - フロントエンドホスティング
- **GitHub Actions** - CI/CD + 定期実行

## クイックスタート

### 前提条件
- Node.js 18以上
- Supabaseアカウント
- GitHubアカウント（デプロイする場合）

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

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQLエディタで以下を実行：

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
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_stamp BOOLEAN DEFAULT false
);

-- Storageバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true);
```

### 4. 環境変数の設定

```bash
cd client
cp .env.example .env
```

`.env`を編集：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:5173 でアクセス可能

詳細は [SETUP.md](./SETUP.md) を参照してください。

## プロジェクト構造

```
.
├── client/                   # Reactフロントエンド
│   └── src/
│       ├── components/      # UIコンポーネント
│       │   ├── ChatRoom.tsx          # チャットメイン画面
│       │   ├── Header.tsx            # ヘッダー
│       │   ├── LoginForm.tsx         # ログイン画面
│       │   ├── MessageInput.tsx      # メッセージ入力欄
│       │   ├── MessageItem.tsx       # メッセージ表示
│       │   ├── MessageList.tsx       # メッセージリスト
│       │   └── StampPicker.tsx       # スタンプピッカー
│       ├── hooks/           # カスタムフック
│       │   └── useChat.ts            # チャット機能フック
│       ├── lib/             # ライブラリ設定
│       │   └── supabase.ts           # Supabaseクライアント
│       └── types/           # 型定義
│           └── index.ts              # 共通型定義
├── specs/                   # 仕様ファイル
│   ├── chat-app.spec.md     # アプリケーション仕様
│   └── api.spec.yaml        # API仕様（レガシー）
└── .github/workflows/       # CI/CDワークフロー
    ├── ci.yml               # ビルド・型チェック
    └── keep-alive.yml       # Supabase自動停止防止
```

## データベーススキーマ

### usersテーブル
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | TEXT | ユーザーID（主キー） |
| password | TEXT | パスワード |
| display_name | TEXT | 表示名 |

### messagesテーブル
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | メッセージID（主キー） |
| username | TEXT | 送信者ID |
| display_name | TEXT | 送信者表示名 |
| content | TEXT | メッセージ本文（NULL可） |
| created_at | TIMESTAMP | 作成日時 |
| file_url | TEXT | 添付ファイルURL |
| file_name | TEXT | ファイル名 |
| file_size | INTEGER | ファイルサイズ（バイト） |
| file_type | TEXT | MIMEタイプ |
| is_stamp | BOOLEAN | スタンプフラグ |

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントにログイン
2. GitHubリポジトリを連携
3. 環境変数を設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. ビルド設定：
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
5. デプロイ実行

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### GitHub Actions設定

自動デプロイとKeep-Alive機能のため、GitHub Secretsに以下を設定：

1. リポジトリ Settings > Secrets and variables > Actions
2. 以下のシークレットを追加：
   - `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key

## 使い方

### ログイン
1. ログイン画面でユーザーIDとパスワードを入力

### メッセージ送信
- テキスト入力して「送信」ボタン
- Enterキーで送信（Shift+Enterで改行）
- 500文字まで入力可能

### ファイル添付
- 「📎 ファイル」ボタンをクリック
- 対応形式：
  - 画像：JPG, PNG, GIF
  - ドキュメント：Word (.docx/.doc), Excel (.xlsx/.xls), PowerPoint (.pptx/.ppt)
- 最大ファイルサイズ：10MB

### スタンプ送信
- 「😊 スタンプ」ボタンをクリック
- 20種類の絵文字から選択
- 通常のメッセージより大きく表示

## 開発ガイドライン

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
style: デザイン変更
refactor: リファクタリング
docs: ドキュメント更新
chore: ビルド設定など
```

### ブランチ戦略
- `main` - 本番環境（自動デプロイ）
- `feature/*` - 新機能開発
- `fix/*` - バグ修正

## アーキテクチャ

サーバーレスアーキテクチャを採用し、フロントエンドから直接Supabaseに接続します。

```
[ユーザー]
    ↓
[Vercel - React App]
    ↓
[Supabase]
  ├─ Database (PostgreSQL)
  ├─ Realtime (WebSocket)
  └─ Storage (Files)
```

詳細は [ARCHITECTURE.md](./ARCHITECTURE.md) を参照してください。

## トラブルシューティング

### Supabaseが7日で停止する
- GitHub Actionsの「Keep Supabase Alive」が6日ごとに自動実行
- 手動実行：Actions > Keep Supabase Alive > Run workflow

### メッセージ送信エラー
1. **is_stamp カラムエラー**
   ```sql
   ALTER TABLE messages ADD COLUMN is_stamp BOOLEAN DEFAULT false;
   ```

2. **content NOT NULL エラー**
   ```sql
   ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
   ```

### ファイルアップロードエラー
- Supabaseで`chat-files`バケットが作成されているか確認
- バケットがpublicに設定されているか確認

## パフォーマンス最適化

- 画像サイズ：250x250pxに統一
- メッセージ取得：必要なカラムのみ選択
- リアルタイム：messagesテーブルのINSERTイベントのみ購読

## セキュリティ

- パスワードは平文保存（本番環境では暗号化推奨）
- Row Level Security（RLS）は未設定（本番環境では設定推奨）
- ファイルアップロードはサイズ・形式を検証

## ライセンス

MIT

## コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ドキュメント

- [セットアップガイド](./SETUP.md) - 開発環境のセットアップ
- [デプロイガイド](./DEPLOYMENT.md) - 本番環境へのデプロイ
- [アーキテクチャ](./ARCHITECTURE.md) - システム設計と構成

## サポート

問題や質問がある場合は、GitHubのIssueを作成してください。
