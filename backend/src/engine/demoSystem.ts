import { Server } from 'socket.io';
import { createRoom } from '../rooms/roomManager';
import { addBotToRoom, evaluateGameLoop } from './botEngine';

export const DEMO_TABLES = [
  { id: 'M-GENESIS', name: 'Midnight Genesis', type: "No Limit Hold'em", stakes: "10K / 20K USDC", maxBots: 5 },
  { id: 'M-OBSIDIAN', name: 'Obsidian Node', type: "No Limit Hold'em", stakes: "50K / 100K USDC", maxBots: 6 },
  { id: 'M-CIPHER', name: 'Cipher Room', type: "No Limit Hold'em", stakes: "1K / 2K USDC", maxBots: 4 },
  { id: 'M-NEON', name: 'Neon Vault', type: "No Limit Hold'em", stakes: "5K / 10K USDC", maxBots: 7 },
];

export const initializeDemoTables = (io: Server) => {
  console.log("Initializing Persistent Demo Tables...");
  
  DEMO_TABLES.forEach(tableInfo => {
    // 1. Create Room
    const room = createRoom(tableInfo.id, tableInfo.name, tableInfo.type, tableInfo.stakes);
    room.isDemo = true;

    // 2. Add Bots
    for (let i = 0; i < tableInfo.maxBots; i++) {
      addBotToRoom(tableInfo.id);
    }

    // 3. Start Game Loop
    setTimeout(() => {
      evaluateGameLoop(io, tableInfo.id);
    }, 2000 + Math.random() * 3000); // Stagger starts
  });
};
