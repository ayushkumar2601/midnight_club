"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveRooms = exports.removeSpectator = exports.addSpectator = exports.leaveRoom = exports.joinRoom = exports.getRoom = exports.createRoom = void 0;
const gameState_1 = require("../state/gameState");
const rooms = {};
const createRoom = (roomId, name, type, stakes) => {
    if (rooms[roomId])
        throw new Error("Room already exists");
    const room = {
        id: roomId,
        name,
        type,
        stakes,
        gameState: (0, gameState_1.createInitialGameState)(),
        spectators: []
    };
    rooms[roomId] = room;
    return room;
};
exports.createRoom = createRoom;
const getRoom = (roomId) => {
    return rooms[roomId];
};
exports.getRoom = getRoom;
const joinRoom = (roomId, player) => {
    let room = (0, exports.getRoom)(roomId);
    if (!room) {
        room = (0, exports.createRoom)(roomId);
    }
    // check if player already in room
    const existingPlayer = room.gameState.players.find(p => p.id === player.id);
    if (!existingPlayer) {
        room.gameState.players.push(player);
    }
    else {
        // Reconnect logic: update name or handle reconnection if needed
        existingPlayer.name = player.name;
    }
    return room;
};
exports.joinRoom = joinRoom;
const leaveRoom = (roomId, playerId) => {
    const room = (0, exports.getRoom)(roomId);
    if (room) {
        room.gameState.players = room.gameState.players.filter(p => p.id !== playerId);
        if (room.gameState.players.length === 0 && room.spectators.length === 0) {
            delete rooms[roomId];
        }
    }
};
exports.leaveRoom = leaveRoom;
const addSpectator = (roomId, socketId) => {
    let room = (0, exports.getRoom)(roomId);
    if (!room) {
        room = (0, exports.createRoom)(roomId);
    }
    if (!room.spectators.includes(socketId)) {
        room.spectators.push(socketId);
    }
    return room;
};
exports.addSpectator = addSpectator;
const removeSpectator = (roomId, socketId) => {
    const room = (0, exports.getRoom)(roomId);
    if (room) {
        room.spectators = room.spectators.filter(id => id !== socketId);
    }
};
exports.removeSpectator = removeSpectator;
const getActiveRooms = () => {
    return Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name || `Node ${room.id}`,
        players: room.gameState.players.length,
        maxPlayers: 8, // hardcode for now
        pot: room.gameState.pot,
        inProgress: room.gameState.inProgress,
        spectators: room.spectators.length,
        type: room.type || "No Limit Hold'em",
        stakes: room.stakes || "1K / 2K USDC",
        isDemo: room.isDemo || false
    }));
};
exports.getActiveRooms = getActiveRooms;
