import { GameState, ActionPayload, Player } from '../types';

export const handlePlayerAction = (state: GameState, playerId: string, actionPayload: ActionPayload): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error("Player not found");
  if (playerIndex !== state.activePlayerIndex) throw new Error("Not player's turn");

  const player = state.players[playerIndex];
  const newState = { ...state, players: [...state.players] };
  const newPlayer = { ...player };
  newState.players[playerIndex] = newPlayer;

  const { action, amount } = actionPayload;

  switch (action) {
    case 'fold':
      newPlayer.state = 'folded';
      break;

    case 'check':
      if (newPlayer.bet < newState.currentBet) {
        throw new Error("Cannot check, must call or raise");
      }
      break;

    case 'call':
      const callAmount = newState.currentBet - newPlayer.bet;
      if (callAmount > newPlayer.chips) {
        // implicitly all-in
        newState.pot += newPlayer.chips;
        newPlayer.bet += newPlayer.chips;
        newPlayer.chips = 0;
        newPlayer.state = 'all-in';
      } else {
        newState.pot += callAmount;
        newPlayer.chips -= callAmount;
        newPlayer.bet += callAmount;
      }
      break;

    case 'raise':
      if (!amount) throw new Error("Raise amount required");
      const raiseAmount = amount; // total bet amount player wants to reach
      if (raiseAmount <= newState.currentBet) {
        throw new Error("Raise amount must be greater than current bet");
      }
      const additionalChips = raiseAmount - newPlayer.bet;
      if (additionalChips > newPlayer.chips) {
        throw new Error("Not enough chips to raise that amount");
      }
      
      newState.pot += additionalChips;
      newPlayer.chips -= additionalChips;
      newPlayer.bet = raiseAmount;
      newState.currentBet = raiseAmount;

      if (newPlayer.chips === 0) {
        newPlayer.state = 'all-in';
      }
      break;

    default:
      throw new Error("Invalid action");
  }

  // advance turn
  newState.activePlayerIndex = getNextActivePlayerIndex(newState);

  return newState;
};

export const getNextActivePlayerIndex = (state: GameState): number => {
  let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
  // keep looking until we find an active player or loop fully
  let loops = 0;
  while (state.players[nextIndex].state !== 'active' && loops < state.players.length) {
    nextIndex = (nextIndex + 1) % state.players.length;
    loops++;
  }
  return nextIndex;
};

export const isRoundComplete = (state: GameState): boolean => {
  const activePlayers = state.players.filter(p => p.state === 'active' || p.state === 'all-in');
  if (activePlayers.length <= 1) return true; // everyone else folded

  // all non-all-in active players must have matched the current bet
  return state.players.every(p => {
    if (p.state === 'folded' || p.state === 'all-in') return true;
    if (p.state === 'active') return p.bet === state.currentBet;
    return true; // waiting state
  });
};
