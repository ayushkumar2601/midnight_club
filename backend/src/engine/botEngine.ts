import { Server } from 'socket.io';
import { getRoom, joinRoom } from '../rooms/roomManager';
import { handlePlayerAction, isRoundComplete } from './bettingEngine';
import { emitPublicState } from '../socket/utils';
import { determineWinner } from './handEvaluator';
import { advanceRound } from './roundManager';
import { resetGameStateForNextHand } from '../state/gameState';
import { recordEvent } from '../midnight/replay';
import { createDeck, shuffleDeck, drawCards } from './deck';

const BOT_ID_PREFIX = 'BOT_';

const BOT_IDENTITIES = [
  { name: 'VEIL-7', color: '#FD5200', title: 'SENTINEL', style: 'Tight-Passive' },
  { name: 'CipherGhost', color: '#58A6FF', title: 'HACKER', style: 'Loose-Aggressive' },
  { name: 'NODE_X', color: '#8B5CF6', title: 'CORE', style: 'Tight-Aggressive' },
  { name: 'BlackSun', color: '#EF4444', title: 'SYNDICATE', style: 'Aggressive' },
  { name: 'Obsidian', color: '#B3B3B3', title: 'ELITE', style: 'Passive' },
  { name: 'Kairo', color: '#10B981', title: 'FIXER', style: 'Loose-Passive' },
  { name: 'Zenith', color: '#FBBF24', title: 'OVERSEER', style: 'Tight-Aggressive' },
  { name: 'NullProtocol', color: '#6B7280', title: 'AI_AGENT', style: 'Optimal' },
];

const CYBER_CHAT_MESSAGES = [
  "Initializing predictive calculation matrices.",
  "Analyzing opponent hand commitment entropy.",
  "Standard betting deviation detected.",
  "Calculating fold-equity percentage: 98.4%",
  "Confidential transaction validated by local client.",
  "A flawless bluff opportunity presents itself.",
  "Re-establishing RNG entropy seed.",
  "Are you running ZK proof updates on a phone? Too slow.",
  "Optimal move sequence loaded.",
  "System alert: Excess credits identified in pot."
];

const activeIntervals: Record<string, NodeJS.Timeout> = {};

export const addBotToRoom = (roomId: string) => {
  const room = getRoom(roomId);
  if (!room) return;

  const currentPlayers = room.gameState.players;
  if (currentPlayers.length >= 8) return; 

  const usedNames = new Set(currentPlayers.map(p => p.name));
  const unusedIdentity = BOT_IDENTITIES.find(id => !usedNames.has(id.name)) || 
    { name: `Agent_${Math.floor(Math.random() * 1000)}`, color: '#666666', title: 'NODE_BOT', style: 'Optimal' };

  const botId = `${BOT_ID_PREFIX}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  joinRoom(roomId, {
    id: botId,
    name: unusedIdentity.name,
    chips: 250000, 
    bet: 0,
    state: 'waiting',
    cards: [],
    avatarColor: unusedIdentity.color,
    title: unusedIdentity.title,
    playStyle: unusedIdentity.style,
    hasActedThisRound: false
  });
};

export const startDemoGame = (io: Server, roomId: string) => {
  const room = getRoom(roomId);
  if (!room) return;

  const state = room.gameState;
  
  state.players.forEach(p => {
    if (p.chips <= 0) {
      p.chips = 250000; 
    }
    p.state = 'waiting';
    p.bet = 0;
    p.hasActedThisRound = false;
    p.cards = [];
  });

  state.inProgress = true;
  state.communityCards = [];
  state.round = 'preflop';
  
  const seed = Math.random().toString(36).substring(2, 15);
  state.midnightState.privateState.rngSeed = seed;
  state.midnightState.privateState.deckOrder = shuffleDeck(createDeck());
  
  state.players.forEach(p => {
    p.state = 'active';
    p.hasActedThisRound = false;
    p.cards = drawCards(state.midnightState.privateState.deckOrder, 2);
    state.midnightState.privateState.playerHands[p.id] = p.cards;
    state.midnightState.publicState.playerHandCommitments[p.id] = `HASH_COMMIT_${p.id}_${Date.now()}`;
  });
  
  state.midnightState.publicState.deckCommitment = `DECK_COMMIT_${Date.now()}`;

  const shuffleProof = { 
    type: 'SHUFFLE' as const, 
    proofBytes: `SHUFFLE_PROOF_${Date.now()}_${seed.substring(0,8)}`, 
    publicInputs: ['OLD_COMMIT', state.midnightState.publicState.deckCommitment] 
  };
  recordEvent(roomId, { timestamp: Date.now(), type: 'SHUFFLE', proof: shuffleProof, publicInputs: shuffleProof.publicInputs });

  state.pot = state.smallBlind + state.bigBlind;
  state.currentBet = state.bigBlind;
  
  if (state.players.length >= 2) {
    state.players[0].chips -= state.smallBlind;
    state.players[0].bet = state.smallBlind;
    state.players[1].chips -= state.bigBlind;
    state.players[1].bet = state.bigBlind;
    state.activePlayerIndex = 2 % state.players.length; 
  }

  console.log(`\n[DECK ENGINE] Game started for room ${roomId}. Seed: ${seed}`);
  emitPublicState(io, roomId, state);
  evaluateBotTurn(io, roomId);
};

// AUTHORITATIVE STATE MACHINE PROGRESSOR (Central Gameplay Sync)
export const progressGameState = (io: Server, roomId: string) => {
  const room = getRoom(roomId);
  if (!room || !room.gameState.inProgress) return;

  let state = room.gameState;

  // 1. Audit Folded State (Early Fold Victory)
  const activePlayers = state.players.filter(p => p.state !== 'folded' && p.state !== 'waiting');
  if (activePlayers.length <= 1) {
    const winner = activePlayers[0] || state.players.find(p => p.state !== 'folded');
    if (winner) {
      winner.chips += state.pot;
      
      const winEvent = {
        results: [{ playerId: winner.id, rank: 'High Card', score: 0 }],
        winnerId: winner.id,
        pot: state.pot,
        message: `${winner.name} wins the pot of $${state.pot.toLocaleString()} (all other players folded).`
      };
      
      console.log(`[EARLY WINNER] ${winner.name} won $${state.pot} in room ${roomId}.`);
      io.to(roomId).emit('showdown', winEvent);
    }
    
    state.inProgress = false;
    emitPublicState(io, roomId, state);

    setTimeout(() => {
      const nextRoom = getRoom(roomId);
      if (nextRoom) {
        nextRoom.gameState = resetGameStateForNextHand(nextRoom.gameState);
        emitPublicState(io, roomId, nextRoom.gameState);
      }
    }, 5000);
    return;
  }

  // 2. Betting Round Complete Check & Board Runouts
  if (isRoundComplete(state)) {
    // If multiple all-ins or betting has ended on River, fast-forward to showdown
    while (isRoundComplete(state) && state.round !== 'showdown' && state.inProgress) {
      if (state.round === 'river') {
        state.round = 'showdown';
        break;
      } else {
        state = advanceRound(state);
        room.gameState = state;
        console.log(`[ROUND ADVANCE] Advanced room ${roomId} to ${state.round}. Community: ${state.communityCards.length} cards.`);
      }
    }

    if (state.round === 'showdown' && state.inProgress) {
      const results = determineWinner(state.players, state.communityCards);
      const winner = results[0];
      const winnerPlayer = state.players.find(p => p.id === winner.playerId);
      if (winnerPlayer) winnerPlayer.chips += state.pot;

      const showdownProof = {
        type: 'SHOWDOWN' as const,
        proofBytes: `SHOWDOWN_PROOF_${Date.now()}_${winner.playerId}`,
        publicInputs: [state.midnightState.publicState.playerHandCommitments[winner.playerId]],
        revealedCards: state.midnightState.privateState.playerHands[winner.playerId] || [],
        score: winner.score
      };
      recordEvent(roomId, { timestamp: Date.now(), type: 'SHOWDOWN', proof: showdownProof, publicInputs: showdownProof.publicInputs });

      console.log(`[SHOWDOWN] Showdown evaluated in room ${roomId}. Winner: ${winnerPlayer?.name} with ${winner.rank}`);
      io.to(roomId).emit('showdown', { results, winnerId: winner.playerId, pot: state.pot, proof: showdownProof });

      state.inProgress = false;
      emitPublicState(io, roomId, state);

      setTimeout(() => {
        const nextRoom = getRoom(roomId);
        if (nextRoom) {
          nextRoom.gameState = resetGameStateForNextHand(nextRoom.gameState);
          emitPublicState(io, roomId, nextRoom.gameState);
        }
      }, 5000);
      return;
    }
  }

  // Write high-visibility logs for developer terminal monitoring
  console.log(`\n=================== GAME STATE TICK ===================`);
  console.log(`Room: ${roomId} | Round: ${state.round.toUpperCase()} | Pot: $${state.pot.toLocaleString()}`);
  console.log(`Players Count: ${state.players.length} | Active Turn Index: ${state.activePlayerIndex} (${state.players[state.activePlayerIndex]?.name})`);
  console.log(`Community Cards: ${state.communityCards.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(', ') || 'None'}`);
  console.log(`========================================================\n`);

  emitPublicState(io, roomId, state);

  // 3. Trigger Bot Decisions if active
  if (state.inProgress) {
    evaluateBotTurn(io, roomId);
  }
};

export const evaluateBotTurn = (io: Server, roomId: string) => {
  const room = getRoom(roomId);
  if (!room || !room.gameState.inProgress) return;

  const state = room.gameState;
  const activePlayer = state.players[state.activePlayerIndex];
  if (!activePlayer || !activePlayer.id.startsWith(BOT_ID_PREFIX)) return;
  if (activePlayer.state !== 'active') return;

  const delay = 1200 + Math.random() * 1500;

  setTimeout(() => {
    const currentRoom = getRoom(roomId);
    if (!currentRoom || !currentRoom.gameState.inProgress) return;

    const currentState = currentRoom.gameState;
    const currentActivePlayer = currentState.players[currentState.activePlayerIndex];
    if (currentActivePlayer.id !== activePlayer.id) return;

    const callAmount = currentState.currentBet - currentActivePlayer.bet;
    let action: 'fold' | 'check' | 'call' | 'raise' = 'check';
    let amount: number | undefined;

    const rand = Math.random();

    if (rand < 0.15) {
      const message = CYBER_CHAT_MESSAGES[Math.floor(Math.random() * CYBER_CHAT_MESSAGES.length)];
      io.to(roomId).emit('botChat', {
        sender: currentActivePlayer.name,
        message,
        color: currentActivePlayer.avatarColor
      });
    }

    if (callAmount === 0) {
      if (rand < 0.25) {
        action = 'raise';
        amount = currentState.currentBet === 0 ? currentState.bigBlind * 2 : currentState.currentBet * 2;
      } else {
        action = 'check';
      }
    } else {
      if (rand < 0.10) {
        action = 'fold';
      } else if (rand < 0.30 && currentActivePlayer.chips > callAmount * 2) {
        action = 'raise';
        amount = currentState.currentBet * 2;
      } else {
        action = 'call';
      }
    }

    try {
      console.log(`[BOT ACTION] ${currentActivePlayer.name} takes action: ${action.toUpperCase()} (${amount || ''}) in room ${roomId}`);
      currentRoom.gameState = handlePlayerAction(currentRoom.gameState, currentActivePlayer.id, { action, amount });
      
      const actionProof = {
        type: 'ACTION' as const,
        proofBytes: `ACTION_PROOF_${Date.now()}_${currentActivePlayer.id}_${action}`,
        publicInputs: [currentActivePlayer.id, action, currentRoom.gameState.pot]
      };
      recordEvent(roomId, { timestamp: Date.now(), type: 'ACTION', proof: actionProof, publicInputs: actionProof.publicInputs });

      progressGameState(io, roomId);
      
    } catch (err) {
      console.error("Bot action error:", err);
    }
  }, delay);
};

export const evaluateGameLoop = (io: Server, roomId: string) => {
  if (activeIntervals[roomId]) return; 

  console.log(`Starting persistent automated loop for room: ${roomId}`);
  
  const interval = setInterval(() => {
    const room = getRoom(roomId);
    if (!room) {
      clearInterval(interval);
      delete activeIntervals[roomId];
      return;
    }

    const state = room.gameState;
    
    if (state.players.length < 5) {
      addBotToRoom(roomId);
      emitPublicState(io, roomId, state);
    }

    if (!state.inProgress && state.players.length >= 2) {
      console.log(`Auto-starting persistent hand in room: ${roomId}`);
      startDemoGame(io, roomId);
    }
  }, 4000);

  activeIntervals[roomId] = interval;
};
