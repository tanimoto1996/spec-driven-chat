# アーキテクチャ

## システム構成

このプロジェクトは**完全サーバーレス**な構成を採用しています。

```
┌─────────────────────────────────────────────┐
│           クライアント（Vercel）             │
│  - React + TypeScript + Vite                │
│  - Supabase Client                          │
└─────────────┬───────────────────────────────┘
              │
              │ Supabase Realtime (WebSocket)
              │ + REST API
              │
┌─────────────▼───────────────────────────────┐
│         Supabase (BaaS)                     │
│  - PostgreSQL Database                      │
│  - Realtime (リアルタイム通信)               │
│  - Authentication (将来の拡張用)            │
│  - Row Level Security                       │
└─────────────────────────────────────────────┘
```

## 技術スタック

### フロントエンド（Vercel）
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Supabase JS Client** - データベース + Realtime通信

### バックエンド（Supabase）
- **PostgreSQL** - リレーショナルデータベース
- **Supabase Realtime** - リアルタイム通信（WebSocket代替）
- **Row Level Security (RLS)** - セキュリティ
- **Presence** - オンラインユーザー追跡

## データフロー

### メッセージ送信
```
1. ユーザーがメッセージを入力
2. クライアントがSupabaseにINSERT
3. Supabase Realtimeが全クライアントに通知
4. 全員のUIが自動更新
```

### メッセージ受信
```
1. チャット参加時に過去50件を取得（REST API）
2. Realtime Channelをサブスクライブ
3. 新規メッセージをリアルタイムで受信
4. UIに自動反映
```

### オンラインユーザー追跡
```
1. Presence機能でオンライン状態を追跡
2. 参加/退室を自動検出
3. オンラインユーザー数を表示
```

## メリット

### サーバーレスアーキテクチャの利点
1. **インフラ管理不要** - サーバーの運用・保守が不要
2. **自動スケーリング** - ユーザー数に応じて自動拡張
3. **低コスト** - 使った分だけ課金（無料枠も充実）
4. **高可用性** - Supabaseが自動でバックアップ・冗長化
5. **高速開発** - バックエンドコード不要

### WebSocketサーバー不要
- **以前**: フロントエンド ↔ Socket.io Server ↔ DB
- **現在**: フロントエンド ↔ Supabase (Realtime + DB)

Supabase Realtimeが WebSocket の役割を果たすため、独自のWebSocketサーバーが不要になりました。

## セキュリティ

### Row Level Security (RLS)
PostgreSQLのRLS機能により、データへのアクセスを制御：

```sql
-- 全員がメッセージを読める
CREATE POLICY "Everyone can read messages"
ON messages FOR SELECT USING (true);

-- 全員がメッセージを投稿できる
CREATE POLICY "Everyone can insert messages"
ON messages FOR INSERT WITH CHECK (true);
```

### APIキーの使い分け
- **anon public key**: クライアント側で使用（公開OK）
- **service_role key**: サーバー側専用（使用しない）

RLSにより、anonキーでは制限された操作のみ可能です。

## パフォーマンス

### データベースインデックス
```sql
CREATE INDEX idx_messages_created_at
ON messages(created_at DESC);
```
メッセージ取得を高速化

### メッセージ取得の最適化
- 最新50件のみ取得
- 古いメッセージは自動削除可能（オプション）

### Realtime最適化
```typescript
realtime: {
  params: {
    eventsPerSecond: 10  // レート制限
  }
}
```

## 拡張性

### 将来の機能追加
このアーキテクチャは以下の機能追加が容易：

1. **ユーザー認証**
   - Supabase Authを有効化
   - RLSポリシーを更新

2. **プライベートメッセージ**
   - roomテーブルを追加
   - チャンネルごとにRealtime接続

3. **ファイル共有**
   - Supabase Storageを使用

4. **メッセージ検索**
   - PostgreSQL Full Text Search

5. **通知機能**
   - Supabase Edge Functions

## コスト見積もり

### Supabase（無料プラン）
- 500MB データベース
- 2GB ファイルストレージ
- 5万 月間アクティブユーザー
- 200万 Realtime メッセージ/月

### Vercel（無料プラン）
- 100GB 帯域幅/月
- 無制限デプロイ

**小規模プロジェクトなら完全無料で運用可能！**

## モニタリング

### Supabase Dashboard
- リアルタイムクエリパフォーマンス
- データベース使用状況
- API使用状況

### Vercel Analytics
- ページビュー
- パフォーマンスメトリクス
- エラートラッキング

## まとめ

このアーキテクチャは：
- ✅ サーバーレス
- ✅ スケーラブル
- ✅ メンテナンスフリー
- ✅ 低コスト
- ✅ 高パフォーマンス
- ✅ セキュア

WebSocketサーバーを自前で運用する必要がなく、Supabaseの強力な機能を活用できます。
