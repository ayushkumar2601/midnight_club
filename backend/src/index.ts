import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket';
import { revalidateTimeline, getTimeline } from './midnight/replay';
import { getActiveRooms } from './rooms/roomManager';
import { initializeDemoTables } from './engine/demoSystem';

// ─── Environment ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// ─── Express App ─────────────────────────────────────────────
const app = express();

// Production CORS: allow only the frontend origin. Dev: allow all.
const corsOptions = {
  origin: isProduction ? CLIENT_URL : '*',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── HTTP Server ─────────────────────────────────────────────
const httpServer = createServer(app);

// ─── Socket.IO Server ────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? CLIENT_URL : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── REST Routes ─────────────────────────────────────────────

// Health check endpoint (required for Render)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Midnight Poker Engine running.',
    uptime: process.uptime(),
    env: NODE_ENV,
  });
});

// Ping endpoint for keep-alive
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// Get active rooms for lobby
app.get('/rooms', (_req, res) => {
  res.json(getActiveRooms());
});

// Replay verification endpoint
app.get('/replay/:gameId', (req, res) => {
  const timeline = getTimeline(req.params.gameId);
  if (!timeline) {
    return res.status(404).json({ error: 'Timeline not found' });
  }

  const verification = revalidateTimeline(req.params.gameId);
  res.json({
    timeline,
    verificationResult: verification.isValid ? 'PROVABLY_FAIR' : 'CHEAT_DETECTED',
    failedIndex: verification.failedEventIndex,
  });
});

// ─── Socket Handlers ─────────────────────────────────────────
setupSocketHandlers(io);

// ─── Demo Tables ─────────────────────────────────────────────
initializeDemoTables(io);

// ─── Start Server ────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  MIDNIGHT HOLD'EM — POKER ENGINE`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Client URL: ${CLIENT_URL}`);
  console.log(`  WebSocket transports: websocket, polling`);
  console.log(`══════════════════════════════════════════════════\n`);
});

// ─── Graceful Shutdown ───────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  io.close();
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  io.close();
  httpServer.close(() => {
    process.exit(0);
  });
});
