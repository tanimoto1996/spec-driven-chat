import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ChatService } from './services/ChatService';

const app = express();
const httpServer = createServer(app);

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
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now()
  });
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
