# アーキテクチャ

## 概要

風土チャットは**完全サーバーレス**なアーキテクチャを採用したリアルタイムチャットアプリケーションです。Supabaseをバックエンドとして使用し、独自サーバーを必要としません。

## システム構成

```
┌─────────────────────────────────────────────┐
│      ユーザー（ブラウザ）                    │
│  - Chrome, Safari, Edge, Firefox            │
└─────────────┬───────────────────────────────┘
              │ HTTPS
              │
┌─────────────▼───────────────────────────────┐
│        Vercel（CDN + Hosting）               │
│  - 静的ファイル配信                          │
│  - グローバルエッジネットワーク              │
│  - 自動SSL証明書                            │
└─────────────┬───────────────────────────────┘
              │
              │ React App起動
              │
┌─────────────▼───────────────────────────────┐
│     クライアント（React + TypeScript）        │
│  - SPA (Single Page Application)           │
│  - Supabase JS Client                      │
│  - LINE風UI                                 │
└─────────────┬───────────────────────────────┘
              │
              │ REST API + WebSocket (Realtime)
              │
┌─────────────▼───────────────────────────────┐
│         Supabase（BaaS Platform）            │
│  ┌─────────────────────────────────────┐   │
│  │  PostgreSQL Database                │   │
│  │  - users テーブル                   │   │
│  │  - messages テーブル                │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Realtime（WebSocket）              │   │
│  │  - メッセージのリアルタイム配信      │   │
│  │  - INSERT/UPDATE/DELETEの監視       │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Storage（ファイルストレージ）        │   │
│  │  - chat-files バケット               │   │
│  │  - 画像、ドキュメントの保存          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 技術スタック

### フロントエンド

| 技術 | 用途 | バージョン |
|-----|------|-----------|
| React | UIライブラリ | 18.x |
| TypeScript | 型安全性 | 5.x |
| Vite | ビルドツール | 5.x |
| CSS3 | スタイリング | - |

### バックエンド（Serverless）

| サービス | 用途 | 説明 |
|---------|------|------|
| Supabase Database | データ永続化 | PostgreSQL 15 |
| Supabase Realtime | リアルタイム通信 | WebSocketベース |
| Supabase Storage | ファイル保存 | S3互換 |
| Supabase Auth | 認証（将来） | JWT |

### インフラストラクチャ

| サービス | 用途 |
|---------|------|
| Vercel | フロントエンドホスティング + CDN |
| GitHub Actions | CI/CD + Cron |
| GitHub | ソースコード管理 |

## データモデル

### ER図

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │──┐
│ password        │  │
│ display_name    │  │
└─────────────────┘  │
                     │ 1:N
                     │
                     │
┌─────────────────┐  │
│   messages      │  │
├─────────────────┤  │
│ id (PK)         │  │
│ username (FK)   │──┘
│ display_name    │
│ content         │
│ created_at      │
│ file_url        │
│ file_name       │
│ file_size       │
│ file_type       │
│ is_stamp        │
└─────────────────┘
```

### テーブル詳細

#### usersテーブル

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL
);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | TEXT | PRIMARY KEY | ユーザーID（ログインに使用） |
| password | TEXT | NOT NULL | パスワード（平文・要暗号化） |
| display_name | TEXT | NOT NULL | 表示名（チャットで表示） |

#### messagesテーブル

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  content TEXT,  -- NULL許可
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_stamp BOOLEAN DEFAULT false
);

CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_username ON messages(username);
```

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PRIMARY KEY | メッセージID |
| username | TEXT | NOT NULL | 送信者ID |
| display_name | TEXT | NOT NULL | 送信者表示名 |
| content | TEXT | NULL可 | メッセージ本文（ファイルのみの場合NULL） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時（タイムゾーン付き） |
| file_url | TEXT | NULL可 | 添付ファイルのURL |
| file_name | TEXT | NULL可 | ファイル名 |
| file_size | INTEGER | NULL可 | ファイルサイズ（バイト） |
| file_type | TEXT | NULL可 | MIMEタイプ |
| is_stamp | BOOLEAN | DEFAULT false | スタンプフラグ |

## データフロー

### 1. ログインフロー

```
[ユーザー]
  ↓ ユーザーID + パスワード入力
[LoginForm]
  ↓ supabase.from('users').select().eq('id', xxx).eq('password', xxx)
[Supabase]
  ↓ ユーザー情報返却
[App]
  ↓ ログイン成功、ChatRoom表示
[ChatRoom]
```

### 2. メッセージ送信フロー

```
[MessageInput]
  ↓ メッセージ入力、送信ボタンクリック
[useChat Hook]
  ↓ supabase.from('messages').insert()
[Supabase Database]
  ↓ INSERT実行
[Supabase Realtime]
  ↓ 全クライアントにブロードキャスト
[全ユーザーのMessageList]
  ↓ 新しいメッセージを表示
```

### 3. ファイルアップロードフロー

```
[MessageInput]
  ↓ ファイル選択
[useChat Hook]
  ↓ バリデーション（サイズ・形式チェック）
  ↓ supabase.storage.from('chat-files').upload()
[Supabase Storage]
  ↓ ファイル保存、公開URL取得
[useChat Hook]
  ↓ file_url付きでmessagesにINSERT
[Supabase Database]
  ↓ メッセージ保存
[Supabase Realtime]
  ↓ 全クライアントに通知
[MessageItem]
  ↓ ファイルプレビュー or ダウンロードリンク表示
```

### 4. スタンプ送信フロー

```
[MessageInput]
  ↓ スタンプボタンクリック
[StampPicker]
  ↓ スタンプ選択
[useChat Hook]
  ↓ is_stamp: true でメッセージ送信
[Supabase Database]
  ↓ スタンプとして保存
[MessageItem]
  ↓ 通常より大きく表示（80px）
```

## コンポーネント構成

```
App
├── LoginForm
│   └── (ログイン前)
└── ChatRoom
    ├── Header
    │   └── 戻るボタン + タイトル
    ├── MessageList
    │   └── MessageItem (複数)
    │       ├── テキストメッセージ
    │       ├── 画像プレビュー
    │       ├── ファイルリンク
    │       └── スタンプ表示
    └── MessageInput
        ├── テキスト入力欄
        ├── ファイルボタン
        ├── スタンプボタン
        └── 送信ボタン
        └── StampPicker（モーダル）
```

## 状態管理

### カスタムフック：useChat

```typescript
const useChat = (username, displayName) => {
  // State
  - messages: Message[]        // メッセージ一覧
  - error: string | null       // エラーメッセージ

  // Effects
  - 初回マウント時：過去メッセージ取得
  - Realtimeサブスクリプション設定
  - アンマウント時：サブスクリプション解除

  // Methods
  - sendMessage(content, file?, isStamp?)
    - バリデーション
    - ファイルアップロード（必要な場合）
    - メッセージINSERT
}
```

### グローバル状態

- **ログイン状態**: App.tsxで管理（username, displayName）
- **メッセージ**: useChatフックで管理
- **エラー**: useChatフックで管理

状態管理ライブラリ（Redux, Zustand等）は使用せず、Reactの標準機能で実装。

## リアルタイム通信

### Supabase Realtime

```typescript
// サブスクリプション設定
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    // 新しいメッセージを受信
    setMessages(prev => [...prev, newMessage])
  })
  .subscribe()

// クリーンアップ
supabase.removeChannel(channel)
```

### 通信プロトコル

- **接続**: WebSocket (wss://)
- **フォールバック**: Long Polling
- **認証**: anon key（ヘッダー）

## セキュリティ

### 現在の実装

1. **認証**: Supabaseテーブルで簡易認証
2. **パスワード**: 平文保存（⚠️本番非推奨）
3. **RLS**: 無効（全員が読み書き可能）
4. **ファイル**: 公開バケット（全員がアクセス可能）

### 本番環境推奨設定

#### 1. パスワードの暗号化

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET password = crypt(password, gen_salt('bf'));

-- ログイン時の検証
SELECT * FROM users
WHERE id = $1
AND password = crypt($2, password);
```

#### 2. Row Level Security有効化

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages"
ON messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert"
ON messages FOR INSERT
WITH CHECK (auth.uid()::text = username);
```

#### 3. Storageポリシー

```sql
-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

-- 全員が読み取り可能（公開バケット）
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');
```

## パフォーマンス最適化

### 実装済み

1. **インデックス**: created_at, usernameにINDEX
2. **画像サイズ制限**: 250x250px
3. **ファイルサイズ制限**: 10MB
4. **メッセージ文字数制限**: 500文字
5. **自動スクロール**: 最新メッセージのみ

### 将来の改善案

1. **ページネーション**: 無限スクロール実装
2. **画像最適化**: WebP変換、遅延読み込み
3. **キャッシュ**: React Queryで取得データをキャッシュ
4. **コード分割**: 動的インポートで初期ロード削減

## スケーラビリティ

### 現在のアーキテクチャの限界

- **Supabase無料プラン**:
  - データベース: 500MB
  - ストレージ: 1GB
  - Realtime接続: 200同時接続
  - 7日間非アクティブで停止

### スケーリング戦略

1. **データベース**:
   - 古いメッセージのアーカイブ
   - パーティショニング（日付別）

2. **ストレージ**:
   - 古いファイルの削除ポリシー
   - 外部ストレージ（S3等）への移行

3. **Realtime**:
   - ルーム分割（チャンネル別）
   - 接続プーリング

4. **有料プランへの移行**:
   - Pro: $25/月（8GB DB, 100GB Storage）
   - Team: $599/月（無制限）

## 運用とモニタリング

### GitHub Actions

#### CI/CD (.github/workflows/ci.yml)
- TypeScriptコンパイルチェック
- ビルド確認
- mainブランチへのpushで自動デプロイ

#### Keep-Alive (.github/workflows/keep-alive.yml)
- 6日ごとに自動実行
- Supabaseにクエリを送信
- 7日間非アクティブによる停止を防止

### ログとモニタリング

1. **Supabase Logs**:
   - データベースクエリ
   - Realtime接続
   - Storage操作

2. **Vercel Analytics**:
   - ページビュー
   - パフォーマンス
   - エラー率

3. **ブラウザConsole**:
   - クライアント側エラー
   - ネットワークエラー

## 将来の拡張

### 計画中の機能

1. **ユーザー認証強化**:
   - Supabase Authを使用
   - OAuth対応（Google, GitHub等）

2. **プライベートメッセージ**:
   - 1対1チャット
   - グループチャット

3. **リアクション機能**:
   - メッセージに絵文字リアクション
   - いいね、ハート等

4. **既読管理**:
   - 最終既読位置の保存
   - 未読バッジ表示

5. **検索機能**:
   - メッセージ全文検索
   - ファイル検索

6. **通知機能**:
   - ブラウザ通知
   - メール通知

## まとめ

### アーキテクチャの特徴

✅ **サーバーレス**: インフラ管理不要
✅ **スケーラブル**: 自動スケーリング
✅ **低コスト**: 無料枠で十分運用可能
✅ **高速開発**: バックエンドコード不要
✅ **リアルタイム**: Supabase Realtimeで即座に反映

### 技術選定の理由

- **Supabase**: PostgreSQL + Realtime + Storageが統合
- **Vercel**: GitHub連携、自動デプロイ、グローバルCDN
- **React + TypeScript**: 型安全、大規模開発に適している
- **Vite**: 高速ビルド、HMR対応

このアーキテクチャにより、シンプルかつモダンなチャットアプリケーションを実現しています。
