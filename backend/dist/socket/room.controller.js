"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDisconnect = exports.handleJoinRoom = void 0;
const roomManager_1 = require("../rooms/roomManager");
const utils_1 = require("./utils");
const botEngine_1 = require("../engine/botEngine");
const handleJoinRoom = (io, socket, { roomId, player }) => {
    socket.join(roomId);
    // If player data doesn't exist, create mock data for immediate onboarding
    const activePlayer = player || (socket.id ? {
        id: socket.id,
        name: `User_${socket.id.substring(0, 4).toUpperCase()}`,
        chips: 250000,
        bet: 0,
        state: 'waiting',
        cards: []
    } : undefined);
    if (activePlayer) {
        (0, roomManager_1.joinRoom)(roomId, activePlayer);
    }
    else {
        (0, roomManager_1.addSpectator)(roomId, socket.id);
    }
    const room = (0, roomManager_1.getRoom)(roomId);
    if (room) {
        (0, utils_1.emitPublicState)(io, roomId, room.gameState);
        // Sync private cards for reconnecting player
        if (activePlayer) {
            const p = room.gameState.players.find(p => p.id === activePlayer.id);
            if (p) {
                const privateCards = room.gameState.midnightState.privateState.playerHands[activePlayer.id];
                if (privateCards && privateCards.length > 0) {
                    socket.emit('syncPrivateCards', { playerId: activePlayer.id, cards: privateCards });
                }
            }
        }
        // Instantly spawn bot matchmaking and initiate loop
        (0, botEngine_1.evaluateGameLoop)(io, roomId);
    }
};
exports.handleJoinRoom = handleJoinRoom;
const handleDisconnect = (socket) => {
    console.log('Client disconnected:', socket.id);
    // Room cleanup logic would be more complex in production
    // For now, spectators are removed simply. Players should probably be folded/marked inactive.
};
exports.handleDisconnect = handleDisconnect;
