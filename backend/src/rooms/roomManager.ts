import { Room, Player } from '../types';
import { createInitialGameState } from '../state/gameState';

const rooms: Record<string, Room> = {};

export const createRoom = (roomId: string, name?: string, type?: string, stakes?: string): Room => {
  if (rooms[roomId]) throw new Error("Room already exists");
  
  const room: Room = {
    id: roomId,
    name,
    type,
    stakes,
    gameState: createInitialGameState(),
    spectators: []
  };
  
  rooms[roomId] = room;
  return room;
};

export const getRoom = (roomId: string): Room | undefined => {
  return rooms[roomId];
};

export const joinRoom = (roomId: string, player: Player): Room => {
  let room = getRoom(roomId);
  if (!room) {
    room = createRoom(roomId);
  }

  // check if player already in room
  const existingPlayer = room.gameState.players.find(p => p.id === player.id);
  if (!existingPlayer) {
    room.gameState.players.push(player);
  } else {
    // Reconnect logic: update name or handle reconnection if needed
    existingPlayer.name = player.name;
  }

  return room;
};

export const leaveRoom = (roomId: string, playerId: string): void => {
  const room = getRoom(roomId);
  if (room) {
    room.gameState.players = room.gameState.players.filter(p => p.id !== playerId);
    if (room.gameState.players.length === 0 && room.spectators.length === 0) {
      delete rooms[roomId];
    }
  }
};

export const addSpectator = (roomId: string, socketId: string): Room => {
  let room = getRoom(roomId);
  if (!room) {
    room = createRoom(roomId);
  }
  if (!room.spectators.includes(socketId)) {
    room.spectators.push(socketId);
  }
  return room;
};

export const removeSpectator = (roomId: string, socketId: string): void => {
  const room = getRoom(roomId);
  if (room) {
    room.spectators = room.spectators.filter(id => id !== socketId);
  }
};

export const getActiveRooms = () => {
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
