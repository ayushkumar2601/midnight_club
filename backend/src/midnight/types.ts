import { Card, GameRound } from '../types';

// Types representing the separation of public and private state in a Midnight Contract

export interface PublicGameState {
  pot: number;
  currentBet: number;
  communityCards: Card[]; // Revealed cards
  round: GameRound;
  activePlayerIndex: number;
  commitments: {
    deckCommitment: string;
    playerHandCommitments: Record<string, string>; // playerId -> hash
  };
}

export interface PrivateGameState {
  // These remain hidden inside the confidential contract state or the client's local wallet
  deckOrder: Card[];
  playerHands: Record<string, Card[]>; // playerId -> cards
  rngSeed: string; // The cryptographic seed used for the shuffle
}

export interface Proof {
  proofBytes: string; // Hex string representing the ZK proof
  publicInputs: any[];
}

export interface ShuffleProof extends Proof {
  type: 'SHUFFLE';
  // Proves that the new deckCommitment is a valid permutation of the standard 52-card deck
}

export interface ActionProof extends Proof {
  type: 'ACTION';
  // Proves that the action taken (fold, call, raise) is legal given the player's chip balance (hidden or public) and turn order
}

export interface ShowdownProof extends Proof {
  type: 'SHOWDOWN';
  // Proves that the player's private hand corresponds to their handCommitment, 
  // and computes the final hand score without leaking the exact cards if they lost (optional),
  // or explicitly reveals the winning cards and proves they belong to the commitment.
  revealedCards: Card[];
  score: number;
}
