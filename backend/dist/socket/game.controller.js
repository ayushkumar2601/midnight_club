"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStartGame = void 0;
const roomManager_1 = require("../rooms/roomManager");
const deck_1 = require("../engine/deck");
const replay_1 = require("../midnight/replay");
const utils_1 = require("./utils");
const botEngine_1 = require("../engine/botEngine");
const handleStartGame = (io, roomId) => {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room)
        return;
    const state = room.gameState;
    state.inProgress = true;
    // Phase 2: Midnight Deck Logic
    const seed = Math.random().toString(36).substring(2, 15);
    state.midnightState.privateState.rngSeed = seed;
    state.midnightState.privateState.deckOrder = (0, deck_1.shuffleDeck)((0, deck_1.createDeck)());
    // Deal 2 cards to each active player using the private deck
    state.players.forEach(p => {
        if (p.state !== 'folded' && p.chips > 0) {
            p.state = 'active';
            p.hasActedThisRound = false;
            p.cards = (0, deck_1.drawCards)(state.midnightState.privateState.deckOrder, 2);
            state.midnightState.privateState.playerHands[p.id] = p.cards;
            // Generate commitment
            state.midnightState.publicState.playerHandCommitments[p.id] = `HASH_COMMIT_${p.id}_${Date.now()}`;
        }
    });
    state.midnightState.publicState.deckCommitment = `DECK_COMMIT_${Date.now()}`;
    // Mock Shuffle Proof
    const shuffleProof = { type: 'SHUFFLE', proofBytes: `SHUFFLE_PROOF_${Date.now()}_${seed.substring(0, 8)}`, publicInputs: ['OLD_COMMIT', state.midnightState.publicState.deckCommitment] };
    (0, replay_1.recordEvent)(roomId, { timestamp: Date.now(), type: 'SHUFFLE', proof: shuffleProof, publicInputs: shuffleProof.publicInputs });
    state.pot = state.smallBlind + state.bigBlind;
    state.currentBet = state.bigBlind;
    if (state.players.length >= 2) {
        state.players[0].chips -= state.smallBlind;
        state.players[0].bet = state.smallBlind;
        state.players[1].chips -= state.bigBlind;
        state.players[1].bet = state.bigBlind;
        state.activePlayerIndex = 2 % state.players.length;
    }
    (0, utils_1.emitPublicState)(io, roomId, state);
    (0, botEngine_1.progressGameState)(io, roomId);
};
exports.handleStartGame = handleStartGame;
