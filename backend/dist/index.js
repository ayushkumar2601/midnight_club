"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // allow frontend access
        methods: ["GET", "POST"]
    }
});
const replay_1 = require("./midnight/replay");
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Midnight Poker Engine running.' });
});
const roomManager_1 = require("./rooms/roomManager");
// Get active rooms for lobby
app.get('/rooms', (req, res) => {
    res.json((0, roomManager_1.getActiveRooms)());
});
// Replay verification endpoint for hackathon demo
app.get('/replay/:gameId', (req, res) => {
    const timeline = (0, replay_1.getTimeline)(req.params.gameId);
    if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
    }
    const verification = (0, replay_1.revalidateTimeline)(req.params.gameId);
    res.json({
        timeline,
        verificationResult: verification.isValid ? "PROVABLY_FAIR" : "CHEAT_DETECTED",
        failedIndex: verification.failedEventIndex
    });
});
(0, socket_1.setupSocketHandlers)(io);
const demoSystem_1 = require("./engine/demoSystem");
const stressTest_1 = require("./engine/stressTest");
(0, demoSystem_1.initializeDemoTables)(io);
// Execute comprehensive 100-round poker engine compliance and stress test
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
try {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
    };
    (0, stressTest_1.runAutomatedStressTest)(100);
    console.log = originalLog;
    fs_1.default.writeFileSync(path_1.default.join(__dirname, '../test_output.log'), logs.join('\n'));
}
catch (err) {
    console.error("CRITICAL: Poker Engine Stress Test Failed!", err);
    fs_1.default.writeFileSync(path_1.default.join(__dirname, '../test_output.log'), `CRITICAL: Poker Engine Stress Test Failed!\n${err.message}\n${err.stack}`);
}
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Backend poker engine listening on port ${PORT}`);
});
