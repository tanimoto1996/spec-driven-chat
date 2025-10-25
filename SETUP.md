# セットアップガイド

## 開発環境のセットアップ

### 前提条件

以下がインストールされていることを確認してください:
- Node.js 20.x以上
- npm 10.x以上
- Git

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/tanimoto1996/node-typescript-practice.git
   cd node-typescript-practice
   ```

2. **ルートの依存関係をインストール**
   ```bash
   npm install
   ```

3. **クライアントの依存関係をインストール**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **サーバーの依存関係をインストール**
   ```bash
   cd server
   npm install
   cd ..
   ```

### 環境変数の設定

1. **クライアント環境変数**
   ```bash
   cd client
   cp .env.example .env
   ```

   `.env`ファイルを編集:
   ```
   VITE_SOCKET_URL=http://localhost:3001
   ```

2. **サーバー環境変数**
   ```bash
   cd server
   cp .env.example .env
   ```

   `.env`ファイルを編集:
   ```
   PORT=3001
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

### 開発サーバーの起動

#### 方法1: 統合コマンド（推奨）

ルートディレクトリから:
```bash
npm run dev
```

これで、クライアント（ポート3000）とサーバー（ポート3001）が同時に起動します。

#### 方法2: 個別に起動

**ターミナル1（サーバー）:**
```bash
cd server
npm run dev
```

**ターミナル2（クライアント）:**
```bash
cd client
npm run dev
```

### アクセス

ブラウザで以下にアクセス:
- クライアント: http://localhost:3000
- サーバーヘルスチェック: http://localhost:3001/health

## プロジェクト構造

```
.
├── specs/                    # 仕様ファイル
│   ├── chat-app.spec.md     # メイン仕様書
│   ├── api.spec.yaml        # OpenAPI仕様
│   └── README.md
│
├── client/                   # Reactフロントエンド
│   ├── src/
│   │   ├── components/      # Reactコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── types/           # TypeScript型定義
│   │   ├── App.tsx          # メインアプリ
│   │   └── main.tsx         # エントリーポイント
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                   # Node.jsバックエンド
│   ├── src/
│   │   ├── services/        # ビジネスロジック
│   │   ├── types/           # TypeScript型定義
│   │   ├── utils/           # ユーティリティ
│   │   └── index.ts         # エントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/           # GitHub Actionsワークフロー
│       ├── ci.yml
│       └── spec-change-detection.yml
│
├── package.json             # ルートpackage.json
├── vercel.json              # Vercel設定
├── README.md
├── SETUP.md                 # このファイル
└── DEPLOYMENT.md            # デプロイガイド
```

## 開発ワークフロー

### 1. 仕様駆動開発

新機能を追加する際:

1. **仕様を更新**
   ```bash
   # specs/chat-app.spec.mdを編集
   ```

2. **仕様を検証**
   ```bash
   npm run spec:validate
   ```

3. **実装**
   - 型定義を更新（`client/src/types/`, `server/src/types/`）
   - コンポーネント/サービスを実装

4. **テスト**
   ```bash
   npm test
   ```

### 2. Git操作

```bash
# 新機能ブランチを作成
git checkout -b feature/new-feature

# 変更をコミット
git add .
git commit -m "feat: 新機能を追加"

# プッシュ
git push origin feature/new-feature

# GitHubでPRを作成
```

### 3. CI/CDパイプライン

PR作成時に自動実行:
- 仕様の検証
- TypeScriptコンパイル
- ビルド確認
- 仕様とコードの整合性チェック

### 4. デプロイ

`main`ブランチへのマージで自動デプロイ（GitHub Actions設定済み）

## 便利なコマンド

### ビルド

```bash
# 全体をビルド
npm run build

# クライアントのみ
npm run build:client

# サーバーのみ
npm run build:server
```

### テスト

```bash
# 全体をテスト
npm test

# クライアントのみ
npm run test:client

# サーバーのみ
npm run test:server
```

### コード品質

```bash
# 型チェック（クライアント）
cd client && npx tsc --noEmit

# 型チェック（サーバー）
cd server && npx tsc --noEmit
```

## トラブルシューティング

### ポートが使用中

```bash
# プロセスを確認
lsof -i :3000
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

### 依存関係のエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules client/node_modules server/node_modules
rm package-lock.json client/package-lock.json server/package-lock.json
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### WebSocket接続エラー

1. サーバーが起動しているか確認
2. ポート番号が正しいか確認
3. CORS設定を確認
4. ブラウザのコンソールでエラーを確認

## 次のステップ

1. **機能追加**: `specs/`の仕様を更新して新機能を計画
2. **テスト追加**: Vitestでテストカバレッジを向上
3. **デプロイ**: `DEPLOYMENT.md`を参照して本番環境にデプロイ
4. **拡張**: プライベートメッセージ、ファイル共有などの機能を追加

## サポート

問題が発生した場合:
- GitHubのIssueを作成
- ドキュメントを確認
- ログファイルを確認
