# Chat App - Spec-Driven Development

仕様駆動開発 × AI駆動開発によるリアルタイムチャットアプリケーション

## 概要

このプロジェクトは、仕様駆動開発とGitHub Actionsによる自動化を実現したチャットアプリケーションです。仕様ファイルを基に開発を進め、仕様とコードの整合性を自動的にチェックします。

## 主な機能

- リアルタイムメッセージング（WebSocket）
- ユーザー参加/退室通知
- オンラインユーザー数表示
- レスポンシブデザイン
- XSS対策済み
- 型安全な実装（TypeScript）

## 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Socket.io Client** - WebSocket通信

### バックエンド
- **Node.js** - サーバーランタイム
- **Express** - Webフレームワーク
- **Socket.io** - リアルタイム通信
- **TypeScript** - 型安全性

### DevOps
- **GitHub Actions** - CI/CDパイプライン
- **Vercel** - フロントエンドホスティング
- **OpenAPI** - API仕様管理

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/tanimoto1996/node-typescript-practice.git
cd node-typescript-practice
```

### 2. 依存関係のインストール

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 3. 環境変数の設定

```bash
# クライアント
cp client/.env.example client/.env

# サーバー
cp server/.env.example server/.env
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

- クライアント: http://localhost:3000
- サーバー: http://localhost:3001

詳細は [SETUP.md](./SETUP.md) を参照してください。

## プロジェクト構造

```
.
├── specs/                    # 仕様ファイル
│   ├── chat-app.spec.md     # メイン仕様書
│   └── api.spec.yaml        # OpenAPI仕様
├── client/                   # Reactフロントエンド
│   └── src/
│       ├── components/      # UIコンポーネント
│       ├── hooks/           # カスタムフック
│       └── types/           # 型定義
├── server/                   # Node.jsバックエンド
│   └── src/
│       ├── services/        # ビジネスロジック
│       ├── utils/           # ユーティリティ
│       └── types/           # 型定義
└── .github/workflows/       # CI/CDワークフロー
```

## 仕様駆動開発

このプロジェクトは仕様駆動開発を採用しています。

### 仕様ファイル

- `specs/chat-app.spec.md` - 機能要件、UI仕様、テストシナリオ
- `specs/api.spec.yaml` - OpenAPI 3.0形式のAPI仕様

### 開発フロー

1. **仕様の定義** - `specs/` に要件を記述
2. **型定義の作成** - 仕様から型を定義
3. **実装** - 型に基づいて実装
4. **検証** - GitHub Actionsで自動チェック

### 仕様検証

```bash
# 仕様ファイルの検証
npm run spec:validate
```

## AI駆動開発

GitHub Actionsにより以下を自動化:

### 1. CI/CDパイプライン
- 仕様の検証
- TypeScriptコンパイル
- 型定義の整合性チェック
- APIエンドポイントの実装確認
- 自動デプロイ

### 2. 仕様変更検出
- 仕様ファイル変更の自動検出
- 影響範囲の分析
- PRへの自動コメント
- レビューチェックリストの提供

詳細は [.github/workflows/README.md](./.github/workflows/README.md) を参照してください。

## デプロイ

### 本番環境へのデプロイ

```bash
# Vercel CLIでデプロイ
vercel --prod
```

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### 自動デプロイ

`main`ブランチへのpushで自動的にデプロイされます。

## 開発ガイドライン

### ブランチ戦略

- `main` - 本番環境
- `develop` - 開発環境
- `feature/*` - 新機能開発
- `fix/*` - バグ修正

### コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加
chore: ビルド設定など
```

### プルリクエスト

1. 仕様変更がある場合は`specs/`を更新
2. PRを作成
3. GitHub Actionsの自動チェックを確認
4. レビュー後にマージ

## 今後の拡張予定

- [ ] プライベートメッセージ機能
- [ ] メッセージ履歴の永続化
- [ ] ファイル共有機能
- [ ] リアクション機能
- [ ] ユーザー認証
- [ ] E2Eテストの追加
- [ ] パフォーマンスモニタリング

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
- [仕様書](./specs/README.md) - アプリケーション仕様
- [ワークフロー](./github/workflows/README.md) - CI/CD設定

## サポート

問題や質問がある場合は、GitHubのIssueを作成してください。
