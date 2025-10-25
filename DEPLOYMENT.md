# デプロイガイド

## Vercelへのデプロイ手順

### 前提条件
- GitHubアカウント
- Vercelアカウント（無料プランで可）

### 方法1: Vercel GitHubインテグレーション（推奨）

1. **Vercelにログイン**
   - https://vercel.com にアクセス
   - GitHubアカウントでログイン

2. **新規プロジェクトをインポート**
   - 「Add New」→「Project」をクリック
   - GitHubリポジトリを選択
   - `tanimoto1996/node-typescript-practice` を選択

3. **プロジェクト設定**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd client && npm install && npm run build
   Output Directory: client/dist
   Install Command: npm install && cd client && npm install
   ```

4. **環境変数の設定**
   - 「Environment Variables」セクションで以下を追加:
   ```
   VITE_SOCKET_URL=https://your-server-url.com
   ```

5. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 数分でデプロイ完了

### 方法2: Vercel CLI

1. **Vercel CLIのインストール**
   ```bash
   npm i -g vercel
   ```

2. **ログイン**
   ```bash
   vercel login
   ```

3. **プロジェクトのリンク**
   ```bash
   vercel link
   ```

4. **環境変数の設定**
   ```bash
   vercel env add VITE_SOCKET_URL
   # 値を入力: https://your-server-url.com
   ```

5. **デプロイ**
   ```bash
   # 本番環境へデプロイ
   vercel --prod
   ```

## バックエンドのデプロイ

### オプション1: Render.com（無料プランあり）

1. **Render.comにログイン**
   - https://render.com でアカウント作成

2. **新規Webサービスを作成**
   - 「New」→「Web Service」
   - GitHubリポジトリを接続

3. **設定**
   ```
   Name: chat-app-server
   Environment: Node
   Build Command: cd server && npm install && npm run build
   Start Command: cd server && npm start
   ```

4. **環境変数**
   ```
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   NODE_ENV=production
   ```

### オプション2: Railway.app

1. **Railway.appにログイン**
   - https://railway.app

2. **新規プロジェクト**
   - 「New Project」→「Deploy from GitHub repo」

3. **設定**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **環境変数を設定**

### オプション3: Heroku

```bash
# Heroku CLIでログイン
heroku login

# 既存のHerokuアプリを使用（またはheroku createで新規作成）
cd server
git subtree push --prefix server heroku main

# 環境変数の設定
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-vercel-app.vercel.app
```

## デプロイ後の設定

### 1. クライアントの環境変数を更新

Vercelダッシュボードで:
```
VITE_SOCKET_URL=https://your-backend-url.com
```

### 2. サーバーのCORS設定を更新

サーバーの環境変数:
```
CLIENT_URL=https://your-vercel-app.vercel.app
```

### 3. 再デプロイ

両方のサービスを再デプロイして変更を反映

## 動作確認

1. デプロイされたURLにアクセス
2. ユーザー名を入力してチャットに参加
3. 別のブラウザ/タブで同じURLを開く
4. メッセージを送信して、リアルタイム通信を確認

## トラブルシューティング

### WebSocket接続エラー

**症状**: メッセージが送受信できない

**解決策**:
- `VITE_SOCKET_URL`が正しく設定されているか確認
- サーバーのCORS設定を確認
- ブラウザのコンソールでエラーを確認

### ビルドエラー

**症状**: デプロイに失敗する

**解決策**:
- `package.json`の依存関係を確認
- ビルドコマンドが正しいか確認
- ログを確認して具体的なエラーを特定

### 環境変数が反映されない

**症状**: 設定した環境変数が使用されない

**解決策**:
- 環境変数名が正しいか確認（`VITE_`プレフィックスが必要）
- 再デプロイを実行
- ビルド時に環境変数が埋め込まれることを確認

## コスト最適化

### 無料プランでの運用

- **Vercel**: 個人プロジェクトは無料
- **Render.com**: 無料プランあり（ただし非アクティブ時はスリープ）
- **Railway.app**: 月$5のクレジット付き

### スリープ対策

無料プランでサーバーがスリープする場合:
- UptimeRobotなどで定期的にpingを送る
- ヘルスチェックエンドポイント（`/health`）を使用

## 継続的デプロイ

GitHub Actionsが設定済みのため:
- `main`ブランチへのpushで自動デプロイ
- PR作成時に自動ビルド＆テスト
- 仕様変更時に自動で影響分析

## セキュリティ

### 本番環境での推奨設定

1. **HTTPS化**: Vercel/Renderは自動的にHTTPS化
2. **環境変数**: シークレット情報は環境変数で管理
3. **CORS**: 本番クライアントURLのみ許可
4. **レート制限**: 必要に応じてレート制限を実装

### 追加のセキュリティ対策

- WebSocketの認証実装
- メッセージの暗号化
- ユーザー認証の追加
