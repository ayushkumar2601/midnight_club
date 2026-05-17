import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow frontend access
    methods: ["GET", "POST"]
  }
});

import { revalidateTimeline, getTimeline } from './midnight/replay';

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Midnight Poker Engine running.' });
});

import { getActiveRooms } from './rooms/roomManager';

// Get active rooms for lobby
app.get('/rooms', (req, res) => {
  res.json(getActiveRooms());
});

// Replay verification endpoint for hackathon demo
app.get('/replay/:gameId', (req, res) => {
  const timeline = getTimeline(req.params.gameId);
  if (!timeline) {
    return res.status(404).json({ error: "Timeline not found" });
  }
  
  const verification = revalidateTimeline(req.params.gameId);
  res.json({
    timeline,
    verificationResult: verification.isValid ? "PROVABLY_FAIR" : "CHEAT_DETECTED",
    failedIndex: verification.failedEventIndex
  });
});

setupSocketHandlers(io);

import { initializeDemoTables } from './engine/demoSystem';
import { runAutomatedStressTest } from './engine/stressTest';

initializeDemoTables(io);

// Execute comprehensive 100-round poker engine compliance and stress test - Watch Reload Trigger v1
import fs from 'fs';
import path from 'path';

try {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  runAutomatedStressTest(100);

  console.log = originalLog;
  fs.writeFileSync(path.join(__dirname, '../test_output.log'), logs.join('\n'));
} catch (err: any) {
  console.error("CRITICAL: Poker Engine Stress Test Failed!", err);
  fs.writeFileSync(path.join(__dirname, '../test_output.log'), `CRITICAL: Poker Engine Stress Test Failed!\n${err.message}\n${err.stack}`);
}

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend poker engine listening on port ${PORT}`);
});
