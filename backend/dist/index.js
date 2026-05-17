"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket");
const replay_1 = require("./midnight/replay");
const roomManager_1 = require("./rooms/roomManager");
const demoSystem_1 = require("./engine/demoSystem");
// ─── Environment ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
// ─── Express App ─────────────────────────────────────────────
const app = (0, express_1.default)();
// Production CORS: allow only the frontend origin. Dev: allow all.
const corsOptions = {
    origin: isProduction ? CLIENT_URL : '*',
    methods: ['GET', 'POST'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// ─── HTTP Server ─────────────────────────────────────────────
const httpServer = (0, http_1.createServer)(app);
// ─── Socket.IO Server ────────────────────────────────────────
const io = new socket_io_1.Server(httpServer, {
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
    res.json((0, roomManager_1.getActiveRooms)());
});
// Replay verification endpoint
app.get('/replay/:gameId', (req, res) => {
    const timeline = (0, replay_1.getTimeline)(req.params.gameId);
    if (!timeline) {
        return res.status(404).json({ error: 'Timeline not found' });
    }
    const verification = (0, replay_1.revalidateTimeline)(req.params.gameId);
    res.json({
        timeline,
        verificationResult: verification.isValid ? 'PROVABLY_FAIR' : 'CHEAT_DETECTED',
        failedIndex: verification.failedEventIndex,
    });
});
// ─── Socket Handlers ─────────────────────────────────────────
(0, socket_1.setupSocketHandlers)(io);
// ─── Demo Tables ─────────────────────────────────────────────
(0, demoSystem_1.initializeDemoTables)(io);
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
