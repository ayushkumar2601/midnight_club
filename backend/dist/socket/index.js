"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const room_controller_1 = require("./room.controller");
const game_controller_1 = require("./game.controller");
const player_controller_1 = require("./player.controller");
const botEngine_1 = require("../engine/botEngine");
const roomManager_1 = require("../rooms/roomManager");
const utils_1 = require("./utils");
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('joinRoom', (data) => (0, room_controller_1.handleJoinRoom)(io, socket, data));
        socket.on('startGame', (data) => (0, game_controller_1.handleStartGame)(io, data.roomId));
        socket.on('playerAction', (data) => (0, player_controller_1.handleAction)(io, socket, data));
        socket.on('addBot', (data) => {
            (0, botEngine_1.addBotToRoom)(data.roomId);
            const room = (0, roomManager_1.getRoom)(data.roomId);
            if (room) {
                (0, utils_1.emitPublicState)(io, data.roomId, room.gameState);
            }
        });
        socket.on('disconnect', () => (0, room_controller_1.handleDisconnect)(socket));
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
