import { GameState, Player } from '../types';

export const createInitialGameState = (): GameState => {
  return {
    players: [],
    pot: 0,
    currentBet: 0,
    communityCards: [],
    round: 'preflop',
    activePlayerIndex: 0,
    dealerIndex: 0,
    smallBlind: 10,
    bigBlind: 20,
    inProgress: false,
    midnightState: {
      publicState: {
        deckCommitment: '',
        playerHandCommitments: {}
      },
      privateState: {
        deckOrder: [],
        playerHands: {},
        rngSeed: ''
      }
    }
  };
};

export const resetGameStateForNextHand = (state: GameState): GameState => {
  // Rotate dealer
  const nextDealerIndex = (state.dealerIndex + 1) % state.players.length;
  
  return {
    ...state,
    pot: 0,
    currentBet: 0,
    communityCards: [],
    round: 'preflop',
    activePlayerIndex: 0,
    dealerIndex: nextDealerIndex,
    inProgress: false,
    midnightState: {
      publicState: {
        deckCommitment: '',
        playerHandCommitments: {}
      },
      privateState: {
        deckOrder: [],
        playerHands: {},
        rngSeed: ''
      }
    },
    players: state.players.map(p => ({
      ...p,
      bet: 0,
      state: p.chips > 0 ? 'waiting' : 'folded',
      cards: []
    }))
  };
};
