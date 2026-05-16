import { create } from 'zustand';

// Use same types as backend or mock them for frontend
export type PlayerState = 'waiting' | 'active' | 'folded' | 'all-in';
export interface Card { suit: string; rank: string; }
export interface Player { id: string; name: string; chips: number; bet: number; state: PlayerState; cards?: Card[]; }

export interface PublicGameState {
  players: Player[];
  pot: number;
  currentBet: number;
  communityCards: Card[];
  round: string;
  activePlayerIndex: number;
  dealerIndex: number;
  inProgress: boolean;
  midnightState?: {
    publicState: {
      deckCommitment: string;
      playerHandCommitments: Record<string, string>;
    }
  };
}

interface GameStore {
  gameState: PublicGameState | null;
  roomId: string | null;
  playerId: string | null;
  lastProof: any | null;
  setGameState: (state: PublicGameState) => void;
  setRoomId: (id: string) => void;
  setPlayerId: (id: string) => void;
  setLastProof: (proof: any) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  roomId: null,
  playerId: null,
  lastProof: null,
  setGameState: (state) => set({ gameState: state }),
  setRoomId: (id) => set({ roomId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  setLastProof: (proof) => set({ lastProof: proof }),
}));
