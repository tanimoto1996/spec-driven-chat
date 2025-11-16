# デプロイガイド

このガイドでは、本番環境へのデプロイ手順を説明します。

## 目次

1. [Vercelへのデプロイ](#vercelへのデプロイ)
2. [環境変数の設定](#環境変数の設定)
3. [GitHub Actionsの設定](#github-actionsの設定)
4. [カスタムドメインの設定](#カスタムドメインの設定)
5. [トラブルシューティング](#トラブルシューティング)

## Vercelへのデプロイ

Vercelを使用することで、GitHubリポジトリと連携した自動デプロイが可能です。

### 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランで可）
- Supabaseプロジェクト（セットアップ済み）

### 1. Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubで認証

### 2. 新規プロジェクトの作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ`spec-driven-chat`を選択
3. 「Import」をクリック

### 3. プロジェクト設定

#### Build & Development Settings

以下のように設定：

- **Framework Preset**: `Vite`
- **Root Directory**: `client`（重要！）
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables

「Environment Variables」セクションで以下を追加：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |

**値の取得方法**:
1. Supabaseダッシュボード > Project Settings > API
2. Project URLとanon keyをコピー

### 4. デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（約1-2分）
3. デプロイ成功後、URLが表示されます

例: `https://your-project.vercel.app`

## 環境変数の設定

### Vercelでの環境変数管理

1. Vercelプロジェクトページを開く
2. 「Settings」タブをクリック
3. 「Environment Variables」を選択
4. 変数を追加・編集

### 環境別の設定

- **Production**: 本番環境（mainブランチ）
- **Preview**: プレビュー環境（PRブランチ）
- **Development**: ローカル開発環境

すべての環境で同じSupabaseプロジェクトを使用する場合、全環境にチェックを入れます。

### 環境変数の更新

環境変数を変更した後：

1. 「Save」をクリック
2. 「Deployments」タブに移動
3. 最新のデプロイメントの「...」メニューから「Redeploy」を選択

## GitHub Actionsの設定

### 自動デプロイの設定

`.github/workflows/ci.yml`で自動ビルドを実行しています。

### Keep-Alive機能の設定

Supabaseの自動停止を防ぐため、GitHub Secretsを設定します。

#### 1. GitHub Secretsの追加

1. GitHubリポジトリを開く
2. **Settings** > **Secrets and variables** > **Actions**
3. 「New repository secret」をクリック
4. 以下の2つのシークレットを追加：

**シークレット1**:
- Name: `VITE_SUPABASE_URL`
- Secret: `https://xxxxx.supabase.co`

**シークレット2**:
- Name: `VITE_SUPABASE_ANON_KEY`
- Secret: `eyJhbGci...`（長いトークン）

#### 2. Keep-Aliveの動作確認

1. GitHubリポジトリの「Actions」タブを開く
2. 「Keep Supabase Alive」ワークフローを選択
3. 「Run workflow」で手動実行
4. 成功すれば緑のチェックマークが表示

**自動実行スケジュール**: 6日ごと（UTC 9:00）

## カスタムドメインの設定

### 独自ドメインの追加

1. Vercelプロジェクトページを開く
2. 「Settings」> 「Domains」
3. 「Add」をクリック
4. ドメイン名を入力（例: `chat.yourdomain.com`）
5. DNSレコードを追加：

```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
```

6. DNS設定が反映されるまで待機（最大48時間）

### SSL証明書

Vercelは自動的にLet's EncryptのSSL証明書を発行します。追加設定は不要です。

## デプロイフロー

### 通常のデプロイ

```bash
# 1. 変更をコミット
git add .
git commit -m "feat: 新機能を追加"

# 2. mainブランチにプッシュ
git push origin main

# 3. Vercelが自動デプロイ（約1-2分）
```

### プレビューデプロイ

プルリクエストを作成すると、自動的にプレビュー環境が作成されます。

```bash
# 1. 機能ブランチを作成
git checkout -b feature/new-feature

# 2. 変更をコミット&プッシュ
git add .
git commit -m "feat: 新機能"
git push origin feature/new-feature

# 3. GitHubでPRを作成

# 4. Vercelがプレビュー環境を自動作成
#    PR内にプレビューURLが表示される
```

### ロールバック

問題が発生した場合、以前のデプロイに戻すことができます：

1. Vercelプロジェクトページの「Deployments」タブ
2. 戻したいデプロイメントを選択
3. 「...」メニューから「Promote to Production」

## モニタリング

### Vercel Analytics

1. Vercelプロジェクトページを開く
2. 「Analytics」タブをクリック
3. 以下を確認：
   - ページビュー
   - 訪問者数
   - パフォーマンスメトリクス

### Supabase Logs

1. Supabaseダッシュボードを開く
2. 「Logs」セクションを選択
3. 以下を確認：
   - データベースクエリ
   - Realtime接続
   - Storage操作
   - エラーログ

## パフォーマンス最適化

### ビルドの最適化

#### 1. 依存関係の最小化

不要なパッケージを削除：

```bash
npm uninstall <package-name>
```

#### 2. コード分割

大きなコンポーネントは動的インポートを使用：

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

#### 3. 画像最適化

- WebP形式を使用
- 適切なサイズにリサイズ
- 遅延読み込みを実装

### キャッシュ戦略

Vercelは自動的に静的アセットをキャッシュします。追加設定は不要です。

## トラブルシューティング

### デプロイエラー

#### エラー: `Build failed`

**原因1**: 環境変数が未設定

**解決策**:
1. Vercel Settings > Environment Variables を確認
2. `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`を追加

**原因2**: TypeScriptエラー

**解決策**:
```bash
# ローカルで型チェック
cd client
npm run type-check

# エラーを修正してからデプロイ
```

#### エラー: `Module not found`

**原因**: 依存関係のインストール失敗

**解決策**:
1. `package.json`を確認
2. ローカルで`npm install`を実行して確認
3. 再デプロイ

### 実行時エラー

#### エラー: `Failed to fetch`（本番環境）

**原因**: Supabase接続エラー

**解決策**:
1. Vercelの環境変数を確認
2. ブラウザのコンソールでエラー詳細を確認
3. Supabase URLが正しいか確認

#### エラー: `CORS error`

**原因**: Supabaseの許可オリジン設定

**解決策**:
1. Supabase Dashboard > Authentication > URL Configuration
2. Site URLにVercelのURLを追加：`https://your-project.vercel.app`

### パフォーマンス問題

#### 問題: 初回ロードが遅い

**解決策**:
1. Vercel Analytics でパフォーマンスを確認
2. 大きなライブラリを遅延読み込み
3. 画像を最適化

#### 問題: Realtimeが遅い

**解決策**:
1. Supabase Logsでクエリパフォーマンスを確認
2. インデックスを追加
3. 不要なカラムを選択しない

## セキュリティ

### 環境変数の保護

- `.env`ファイルは`.gitignore`に含める
- GitHub Secretsは暗号化される
- Vercelの環境変数も暗号化される

### Supabaseセキュリティ

本番環境では以下を推奨：

#### 1. Row Level Security (RLS)の有効化

```sql
-- usersテーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own data"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- messagesテーブル
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages"
ON messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = username);
```

#### 2. パスワードの暗号化

現在は平文保存ですが、本番環境では暗号化を推奨：

```sql
-- pgcryptoエクステンションを有効化
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- パスワードをハッシュ化
UPDATE users
SET password = crypt(password, gen_salt('bf'));
```

#### 3. APIキーのローテーション

定期的にSupabaseのAPIキーを更新：

1. Supabase Dashboard > Settings > API
2. 「Generate new anon key」
3. Vercelの環境変数を更新
4. 再デプロイ

## バックアップ

### データベースのバックアップ

Supabaseは自動的に毎日バックアップを作成（有料プラン）。

手動バックアップ：

```bash
# Supabase CLIでエクスポート
supabase db dump -f backup.sql
```

### Storageのバックアップ

重要なファイルは定期的にダウンロード：

```typescript
// ファイル一覧を取得
const { data: files } = await supabase.storage
  .from('chat-files')
  .list()

// ファイルをダウンロード
for (const file of files) {
  const { data } = await supabase.storage
    .from('chat-files')
    .download(file.name)
  // 保存処理
}
```

## 次のステップ

デプロイが完了したら：

1. パフォーマンスモニタリングを設定
2. エラートラッキングを導入（Sentry等）
3. アナリティクスを確認
4. セキュリティ設定を強化

## サポート

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Issues](https://github.com/tanimoto1996/spec-driven-chat/issues)
