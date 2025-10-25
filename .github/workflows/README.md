# GitHub Actions ワークフロー

このディレクトリには、AI駆動開発を実現するGitHub Actionsワークフローが含まれています。

## ワークフロー一覧

### 1. CI/CD Pipeline (`ci.yml`)

**トリガー**: push to main/develop, PR to main

**ジョブ**:
- `spec-validation`: 仕様ファイルの検証
  - 仕様ファイルの存在確認
  - OpenAPI仕様の構文チェック

- `client-build`: クライアントのビルド
  - TypeScriptコンパイル
  - 成果物の保存

- `server-build`: サーバーのビルド
  - TypeScriptコンパイル
  - 成果物の保存

- `spec-code-alignment`: 仕様とコードの整合性チェック
  - 型定義の整合性確認
  - APIエンドポイントの実装確認

- `deploy`: Vercelへのデプロイ（mainブランチのみ）

### 2. 仕様変更検出 (`spec-change-detection.yml`)

**トリガー**: specs/以下のファイルが変更されたPR

**機能**:
- 変更された仕様ファイルの検出
- 影響範囲の自動分析
- PRへの自動コメント追加
- レビュー時のチェックリスト提供

## AI駆動開発の特徴

### 仕様駆動開発の自動化
1. **仕様の検証**: OpenAPI形式の仕様を自動検証
2. **整合性チェック**: 仕様とコードの不一致を検出
3. **影響分析**: 仕様変更による影響範囲を自動分析

### 品質保証
- TypeScriptの型チェック
- ビルドの成功確認
- セキュリティヘッダーの設定

### デプロイ自動化
- mainブランチへのpushで自動デプロイ
- ビルド成果物の保存と再利用

## セットアップ

### 必要なシークレット

Vercelへのデプロイを有効にする場合、以下のシークレットをGitHubリポジトリに設定してください：

```
VERCEL_TOKEN        # Vercel APIトークン
VERCEL_ORG_ID       # Vercel組織ID
VERCEL_PROJECT_ID   # VercelプロジェクトID
```

### Vercel CLIでのデプロイ設定

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトのリンク
vercel link

# 環境変数の設定
vercel env add VITE_SOCKET_URL production
```

## ワークフローの拡張

### テストの追加

各ビルドジョブに以下を追加できます：

```yaml
- name: テスト実行
  run: npm test

- name: カバレッジレポート
  uses: codecov/codecov-action@v3
```

### Lintの追加

```yaml
- name: ESLint
  run: npm run lint

- name: Prettier
  run: npm run format:check
```

### E2Eテスト

```yaml
- name: Playwright E2Eテスト
  run: npm run test:e2e
```

## トラブルシューティング

### ビルドエラー
- `package-lock.json`が最新か確認
- Node.jsバージョンの一致を確認

### デプロイエラー
- Vercelのシークレットが正しく設定されているか確認
- ビルドコマンドが正しいか確認

### 仕様検証エラー
- OpenAPI仕様の構文を確認
- 必要なフィールドが全て含まれているか確認
