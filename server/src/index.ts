import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { ChatService } from './services/ChatService';

const app = express();
const httpServer = createServer(app);

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// CORS設定
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ヘルスチェックエンドポイント（仕様に基づく）
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// ログイン認証エンドポイント
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません'
      });
    }

    res.json({
      success: true,
      user: {
        id: data.id,
        displayName: data.display_name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

// チャットサービスの初期化
const chatService = new ChatService(io);

// Socket.IO接続処理
io.on('connection', (socket) => {
  chatService.handleConnection(socket);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERM受信。サーバーをシャットダウンします...');
  httpServer.close(() => {
    console.log('サーバーが正常に終了しました');
    process.exit(0);
  });
});
