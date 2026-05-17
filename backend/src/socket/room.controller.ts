import { Server, Socket } from 'socket.io';
import { joinRoom, getRoom, addSpectator } from '../rooms/roomManager';
import { Player } from '../types';
import { emitPublicState } from './utils';
import { evaluateGameLoop } from '../engine/botEngine';

export const handleJoinRoom = (io: Server, socket: Socket, { roomId, player }: { roomId: string, player?: Player }) => {
  socket.join(roomId);
  
  // If player data doesn't exist, create mock data for immediate onboarding
  const activePlayer = player || (socket.id ? { 
    id: socket.id, 
    name: `User_${socket.id.substring(0, 4).toUpperCase()}`, 
    chips: 250000, 
    bet: 0, 
    state: 'waiting' as const, 
    cards: [] 
  } : undefined);

  if (activePlayer) {
    socket.data.playerId = activePlayer.id;
    joinRoom(roomId, activePlayer);
  } else {
    addSpectator(roomId, socket.id);
  }
  
  const room = getRoom(roomId);
  if (room) {
    emitPublicState(io, roomId, room.gameState);
    
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
    evaluateGameLoop(io, roomId);
  }
};

export const handleDisconnect = (socket: Socket) => {
  console.log('Client disconnected:', socket.id);
  // Room cleanup logic would be more complex in production
  // For now, spectators are removed simply. Players should probably be folded/marked inactive.
};
