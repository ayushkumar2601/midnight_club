import { GameState } from '../types';
import { drawCards } from './deck';

export const advanceRound = (state: GameState): GameState => {
  const newState = { ...state };
  
  // reset bets and action state for the new round
  newState.players = newState.players.map(p => ({
    ...p,
    bet: 0,
    hasActedThisRound: false
  }));
  newState.currentBet = 0;

  // determine first actor for new round (left of dealer)
  let nextIndex = (newState.dealerIndex + 1) % newState.players.length;
  // find next active player
  let loops = 0;
  while (newState.players[nextIndex].state !== 'active' && loops < newState.players.length) {
    nextIndex = (nextIndex + 1) % newState.players.length;
    loops++;
  }
  newState.activePlayerIndex = nextIndex;

  switch (newState.round) {
    case 'preflop':
      newState.round = 'flop';
      // burn 1, draw 3
      drawCards(newState.midnightState.privateState.deckOrder, 1);
      newState.communityCards = drawCards(newState.midnightState.privateState.deckOrder, 3);
      break;
    case 'flop':
      newState.round = 'turn';
      // burn 1, draw 1
      drawCards(newState.midnightState.privateState.deckOrder, 1);
      newState.communityCards = [...newState.communityCards, ...drawCards(newState.midnightState.privateState.deckOrder, 1)];
      break;
    case 'turn':
      newState.round = 'river';
      drawCards(newState.midnightState.privateState.deckOrder, 1);
      newState.communityCards = [...newState.communityCards, ...drawCards(newState.midnightState.privateState.deckOrder, 1)];
      break;
    case 'river':
      newState.round = 'showdown';
      break;
    case 'showdown':
      // Reset hand or finalize
      break;
  }

  return newState;
};
