# チャットアプリケーション仕様書 v2.0

## 概要
リアルタイムでメッセージとファイルをやり取りできるチャットアプリケーション

**最終更新**: 2025年10月

## アーキテクチャ
- **フロントエンド**: Vercel（React + TypeScript + Vite）
- **バックエンド**: Supabase（完全サーバーレス）
- **データベース**: Supabase PostgreSQL
- **ストレージ**: Supabase Storage
- **リアルタイム通信**: ポーリング方式（2秒間隔）

## 機能要件

### 1. 認証
- **FR-1.1**: ユーザーは名前とパスワードを入力してチャットに参加できる
- **FR-1.2**: ユーザー名は1-20文字の範囲で設定可能
- **FR-1.3**: パスワードは固定値「mamiya」で認証
- **FR-1.4**: パスワードが一致しない場合は参加不可
- **FR-1.5**: 同じユーザー名の重複は許可する

### 2. メッセージ送信
- **FR-2.1**: ユーザーはテキストメッセージを送信できる
- **FR-2.2**: メッセージは1-500文字の範囲で入力可能
- **FR-2.3**: 空のメッセージは送信できない（ファイルのみの場合を除く）
- **FR-2.4**: メッセージにはタイムスタンプが自動付与される
- **FR-2.5**: メッセージはSupabase PostgreSQLに永続的に保存される

### 3. ファイル共有（新機能）
- **FR-3.1**: ユーザーはメッセージにファイルを添付できる
- **FR-3.2**: ファイルサイズは最大10MBまで
- **FR-3.3**: 対応ファイル形式:
  - 画像: JPEG, PNG, GIF, WebP
  - ドキュメント: PDF
  - Microsoft Office: Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
  - テキスト: TXT, CSV
  - アーカイブ: ZIP
- **FR-3.4**: 画像ファイルはチャット内でインライン表示される
- **FR-3.5**: 画像以外のファイルはダウンロードリンクとして表示される
- **FR-3.6**: ファイルはSupabase Storageに保存される
- **FR-3.7**: ファイルのみ（テキストなし）の送信も可能

### 4. メッセージ受信
- **FR-4.1**: 他のユーザーが送信したメッセージを受信できる
- **FR-4.2**: メッセージは送信者名、内容、タイムスタンプ、ファイル情報を含む
- **FR-4.3**: メッセージは時系列で表示される
- **FR-4.4**: チャット参加時に過去100件のメッセージ履歴を取得できる
- **FR-4.5**: 新しいメッセージは2秒以内に反映される（ポーリング方式）

### 5. 接続管理
- **FR-5.1**: オンラインユーザー数は固定値（1）で表示される
- **FR-5.2**: 接続状態（接続中/切断）を表示する

## 技術仕様

### データモデル

#### Message
```typescript
interface Message {
  id: string;           // メッセージID（UUID）
  username: string;     // 送信者名
  content: string;      // メッセージ内容
  timestamp: number;    // タイムスタンプ（Unix time）
  file_url?: string;    // ファイルURL（オプション）
  file_name?: string;   // ファイル名（オプション）
  file_size?: number;   // ファイルサイズ（bytes）（オプション）
  file_type?: string;   // ファイルMIMEタイプ（オプション）
}
```

#### User
```typescript
interface User {
  id: string;          // ユーザーID
  username: string;    // ユーザー名
  joinedAt: number;    // 参加時刻
}
```

### データベーススキーマ

#### messages テーブル
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,

  CONSTRAINT content_length CHECK (char_length(content) <= 500),
  CONSTRAINT username_length CHECK (char_length(username) <= 20),
  CONSTRAINT file_size_limit CHECK (file_size IS NULL OR file_size <= 10485760)
);

CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### Supabase Storage

#### chat-files バケット
- **公開バケット**: はい
- **ファイルサイズ制限**: 10MB
- **許可される操作**:
  - INSERT（アップロード）: 全員可能
  - SELECT（読み取り）: 全員可能

### API仕様

#### メッセージ取得
```typescript
// 最新100件のメッセージを取得
supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: true })
  .limit(100)
```

#### メッセージ送信
```typescript
// テキストメッセージ送信
supabase
  .from('messages')
  .insert({
    username: string,
    content: string
  })

// ファイル付きメッセージ送信
supabase
  .from('messages')
  .insert({
    username: string,
    content: string,
    file_url: string,
    file_name: string,
    file_size: number,
    file_type: string
  })
```

#### ファイルアップロード
```typescript
// Supabase Storageにアップロード
supabase.storage
  .from('chat-files')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  })

// 公開URLを取得
supabase.storage
  .from('chat-files')
  .getPublicUrl(path)
```

## UI仕様

### レイアウト
```
+----------------------------------+
|  チャットアプリ  [接続中] [1人]   |
|  [退室]                          |
+----------------------------------+
|                                  |
|  [メッセージ表示エリア]           |
|                                  |
|  Username: Message               |
|  [画像またはファイル]             |
|  10:30                          |
|                                  |
+----------------------------------+
|  [📎] [メッセージ入力]  [送信]   |
|  0/500                           |
+----------------------------------+
```

### ログイン画面
```
+----------------------------------+
|  チャットアプリへようこそ          |
|                                  |
|  ユーザー名: [_____________]     |
|  パスワード: [_____________]     |
|                                  |
|  [参加する]                      |
+----------------------------------+
```

### カラースキーム
- プライマリカラー: #3b82f6（青）
- セカンダリカラー: #10b981（緑）
- 背景: #f3f4f6（薄灰色）
- テキスト: #1f2937（濃灰色）
- エラー: #ef4444（赤）

## 非機能要件

### パフォーマンス
- **NFR-1**: メッセージ送信から受信まで2秒以内
- **NFR-2**: ファイルアップロードは10秒以内（10MBまで）
- **NFR-3**: 初回ロード時に100件のメッセージ履歴を1秒以内に取得

### セキュリティ
- **NFR-4**: XSS攻撃を防ぐため、メッセージはエスケープ処理する
- **NFR-5**: メッセージ長の制限を実施
- **NFR-6**: ファイルサイズの制限を実施（10MB）
- **NFR-7**: 許可されたファイル形式のみアップロード可能
- **NFR-8**: パスワード認証（固定値: mamiya）
- **NFR-9**: Row Level Security (RLS) によるデータアクセス制御

### 互換性
- **NFR-10**: Chrome、Firefox、Safari、Edgeの最新版をサポート
- **NFR-11**: モバイルブラウザでも利用可能

### 可用性
- **NFR-12**: Supabaseの稼働率に依存（99.9%）
- **NFR-13**: Vercelの稼働率に依存（99.99%）

## テストシナリオ

### TC-1: 認証
1. ログイン画面でユーザー名「TestUser」を入力
2. パスワード「mamiya」を入力
3. 「参加する」をクリック
4. チャット画面が表示されることを確認

### TC-2: 認証失敗
1. ログイン画面でユーザー名「TestUser」を入力
2. パスワード「wrong」を入力
3. 「参加する」をクリック
4. 「パスワードが正しくありません」エラーが表示されることを確認

### TC-3: テキストメッセージ送受信
1. ユーザーAがチャットに参加
2. ユーザーBがチャットに参加
3. ユーザーAが「Hello」というメッセージを送信
4. 2秒以内にユーザーBがメッセージを受信できることを確認

### TC-4: 画像ファイル共有
1. ユーザーAがチャットに参加
2. 📎ボタンをクリックして画像ファイルを選択
3. メッセージを送信
4. 画像がインライン表示されることを確認
5. ユーザーBが同じ画像を確認できることを確認

### TC-5: ドキュメントファイル共有
1. ユーザーAがPDFファイルをアップロード
2. ダウンロードリンクが表示されることを確認
3. リンクをクリックしてファイルがダウンロードできることを確認

### TC-6: メッセージ履歴
1. 既に10件のメッセージが存在する状態
2. 新しいユーザーがチャットに参加
3. 過去の10件のメッセージが表示されることを確認

### TC-7: ファイルサイズ制限
1. 11MBのファイルをアップロードしようとする
2. 「ファイルサイズは10MB以下にしてください」エラーが表示されることを確認

### TC-8: 非対応ファイル形式
1. .exeファイルをアップロードしようとする
2. 「このファイル形式はサポートされていません」エラーが表示されることを確認

## 制限事項

### 現在の制限
1. **オンラインユーザー追跡**: ポーリング方式のため、リアルタイムのユーザー追跡は実装されていない
2. **プライベートメッセージ**: 全員に公開されるメッセージのみ対応
3. **メッセージ編集・削除**: 未対応
4. **既読管理**: 未対応
5. **通知機能**: 未対応
6. **検索機能**: 未対応
7. **ユーザープロフィール**: 未対応

## 今後の拡張予定

### Phase 2
- [ ] Supabase Realtime対応（ポーリングからリアルタイム通信へ）
- [ ] ユーザー認証（Supabase Auth）
- [ ] ユーザープロフィール画像
- [ ] メッセージ編集・削除機能

### Phase 3
- [ ] プライベートメッセージ（DM）機能
- [ ] チャットルーム機能
- [ ] メッセージ検索
- [ ] リアクション機能（絵文字）

### Phase 4
- [ ] 音声・ビデオ通話
- [ ] スレッド機能
- [ ] メンション機能
- [ ] 既読管理

## 変更履歴

### v2.0 (2025-10-26)
- パスワード認証機能を追加
- ファイル添付・共有機能を追加
- Microsoft Office形式（Word、Excel、PowerPoint）に対応
- Supabase Storageを統合
- WebSocketからSupabase + ポーリング方式に変更

### v1.0 (Initial)
- 基本的なチャット機能
- テキストメッセージの送受信
- WebSocketによるリアルタイム通信
