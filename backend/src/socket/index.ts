import { Server, Socket } from 'socket.io';
import { handleJoinRoom, handleDisconnect } from './room.controller';
import { handleStartGame } from './game.controller';
import { handleAction } from './player.controller';
import { addBotToRoom } from '../engine/botEngine';
import { getRoom } from '../rooms/roomManager';
import { emitPublicState } from './utils';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (data) => handleJoinRoom(io, socket, data));
    socket.on('startGame', (data) => handleStartGame(io, data.roomId));
    socket.on('playerAction', (data) => handleAction(io, socket, data));
    socket.on('addBot', (data) => {
      addBotToRoom(data.roomId);
      const room = getRoom(data.roomId);
      if (room) {
        emitPublicState(io, data.roomId, room.gameState);
      }
    });
    socket.on('disconnect', () => handleDisconnect(socket));
  });
};
