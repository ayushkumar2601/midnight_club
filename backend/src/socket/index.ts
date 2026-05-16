import { Server, Socket } from 'socket.io';
import { joinRoom, leaveRoom, getRoom, addSpectator, removeSpectator } from '../rooms/roomManager';
import { handlePlayerAction, isRoundComplete } from '../engine/bettingEngine';
import { advanceRound } from '../engine/roundManager';
import { createDeck, shuffleDeck, drawCards } from '../engine/deck';
import { determineWinner } from '../engine/handEvaluator';
import { resetGameStateForNextHand } from '../state/gameState';
import { ActionPayload, Player } from '../types';
import { recordEvent } from '../midnight/replay';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    const emitPublicState = (roomId: string, state: any) => {
      // Strip private state
      const publicState = JSON.parse(JSON.stringify(state));
      delete publicState.midnightState.privateState;
      
      // Also strip player cards if they aren't revealed
      publicState.players.forEach((p: any) => {
        // Only emit cards at showdown, otherwise hide them
        if (state.round !== 'showdown') {
          p.cards = [];
        }
      });
      
      io.to(roomId).emit('syncState', publicState);
    };

    socket.on('joinRoom', ({ roomId, player }: { roomId: string, player?: Player }) => {
      socket.join(roomId);
      if (player) {
        joinRoom(roomId, player);
      } else {
        addSpectator(roomId, socket.id);
      }
      
      const room = getRoom(roomId);
      if (room) {
        emitPublicState(roomId, room.gameState);
      }
    });

    socket.on('startGame', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;

      const state = room.gameState;
      state.inProgress = true;
      
      // Phase 2: Midnight Deck Logic
      const seed = Math.random().toString(36).substring(2, 15); // Use crypto secure in prod
      state.midnightState.privateState.rngSeed = seed;
      state.midnightState.privateState.deckOrder = shuffleDeck(createDeck());
      
      // Deal 2 cards to each active player using the private deck
      state.players.forEach(p => {
        if (p.state !== 'folded' && p.chips > 0) {
          p.state = 'active';
          p.cards = drawCards(state.midnightState.privateState.deckOrder, 2);
          state.midnightState.privateState.playerHands[p.id] = p.cards;
          // Generate commitment
          state.midnightState.publicState.playerHandCommitments[p.id] = `HASH_COMMIT_${p.id}_${Date.now()}`;
        }
      });
      state.midnightState.publicState.deckCommitment = `DECK_COMMIT_${Date.now()}`;

      // Mock Proof generation and recording
      const shuffleProof = { type: 'SHUFFLE' as const, proofBytes: `SHUFFLE_PROOF_${Date.now()}_${seed.substring(0,8)}`, publicInputs: ['OLD_COMMIT', state.midnightState.publicState.deckCommitment] };
      recordEvent(roomId, { timestamp: Date.now(), type: 'SHUFFLE', proof: shuffleProof, publicInputs: shuffleProof.publicInputs });

      // Simple blind logic for Phase 1
      state.pot = state.smallBlind + state.bigBlind;
      state.currentBet = state.bigBlind;
      // In a real game, deduct from the correct player
      if (state.players.length >= 2) {
        state.players[0].chips -= state.smallBlind;
        state.players[0].bet = state.smallBlind;
        state.players[1].chips -= state.bigBlind;
        state.players[1].bet = state.bigBlind;
        state.activePlayerIndex = (1 + 1) % state.players.length; // left of big blind
      }

      emitPublicState(roomId, state);
    });

    socket.on('playerAction', ({ roomId, playerId, payload }: { roomId: string, playerId: string, payload: ActionPayload }) => {
      const room = getRoom(roomId);
      if (!room) return;

      try {
        room.gameState = handlePlayerAction(room.gameState, playerId, payload);
        
        // Generate Action Proof
        const actionProof = {
          type: 'ACTION' as const,
          proofBytes: `ACTION_PROOF_${Date.now()}_${playerId}_${payload.action}`,
          publicInputs: [playerId, payload.action, room.gameState.pot]
        };
        recordEvent(roomId, { timestamp: Date.now(), type: 'ACTION', proof: actionProof, publicInputs: actionProof.publicInputs });

        // check if round is complete
        if (isRoundComplete(room.gameState)) {
          if (room.gameState.round === 'showdown') {
            // handle winner
            const results = determineWinner(room.gameState.players, room.gameState.communityCards);
            const winner = results[0]; // best hand
            // award pot
            const winnerPlayer = room.gameState.players.find(p => p.id === winner.playerId);
            if (winnerPlayer) winnerPlayer.chips += room.gameState.pot;
            
            // Generate Showdown Proof
            const showdownProof = {
              type: 'SHOWDOWN' as const,
              proofBytes: `SHOWDOWN_PROOF_${Date.now()}_${winner.playerId}`,
              publicInputs: [room.gameState.midnightState.publicState.playerHandCommitments[winner.playerId]],
              revealedCards: room.gameState.midnightState.privateState.playerHands[winner.playerId] || [],
              score: winner.score
            };
            recordEvent(roomId, { timestamp: Date.now(), type: 'SHOWDOWN', proof: showdownProof, publicInputs: showdownProof.publicInputs });

            io.to(roomId).emit('showdown', { results, winnerId: winner.playerId, pot: room.gameState.pot, proof: showdownProof });
            room.gameState = resetGameStateForNextHand(room.gameState);
          } else {
            room.gameState = advanceRound(room.gameState);
          }
        }

        emitPublicState(roomId, room.gameState);
      } catch (err: any) {
        socket.emit('error', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Room cleanup logic would be more complex in production
      // For now, spectators are removed simply. Players should probably be folded/marked inactive.
    });
  });
};
