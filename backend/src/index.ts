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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend poker engine listening on port ${PORT}`);
});
