export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type PlayerState = 'waiting' | 'active' | 'folded' | 'all-in';

export interface Player {
  id: string;
  name: string;
  chips: number;
  bet: number;
  state: PlayerState;
  cards: Card[];
  avatarColor?: string;
  title?: string;
  playStyle?: string;
  hasActedThisRound?: boolean;
}

export type GameRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  players: Player[];
  pot: number;
  currentBet: number;
  communityCards: Card[];
  round: GameRound;
  activePlayerIndex: number;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  inProgress: boolean;

  // Phase 2: Midnight Integration
  midnightState: {
    publicState: {
      deckCommitment: string;
      playerHandCommitments: Record<string, string>;
    };
    privateState: {
      deckOrder: Card[];
      playerHands: Record<string, Card[]>;
      rngSeed: string;
    };
  };
}

export interface Room {
  id: string;
  name?: string;
  type?: string;
  stakes?: string;
  isDemo?: boolean;
  gameState: GameState;
  spectators: string[]; // socket ids
}

export interface ActionPayload {
  action: 'fold' | 'check' | 'call' | 'raise';
  amount?: number;
}
