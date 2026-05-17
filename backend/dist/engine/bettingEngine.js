"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoundComplete = exports.getNextActivePlayerIndex = exports.handlePlayerAction = void 0;
const handlePlayerAction = (state, playerId, actionPayload) => {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1)
        throw new Error("Player not found");
    if (playerIndex !== state.activePlayerIndex)
        throw new Error("Not player's turn");
    const player = state.players[playerIndex];
    if (player.state !== 'active') {
        throw new Error("Player cannot act in current state");
    }
    const newState = { ...state, players: state.players.map(p => ({ ...p })) };
    const newPlayer = newState.players[playerIndex];
    const { action, amount } = actionPayload;
    switch (action) {
        case 'fold':
            newPlayer.state = 'folded';
            newPlayer.hasActedThisRound = true;
            break;
        case 'check':
            if (newPlayer.bet < newState.currentBet) {
                throw new Error("Cannot check, must call or raise");
            }
            newPlayer.hasActedThisRound = true;
            break;
        case 'call':
            const callAmount = newState.currentBet - newPlayer.bet;
            if (callAmount <= 0) {
                // Technically a check
            }
            else if (callAmount >= newPlayer.chips) {
                // implicitly all-in
                newState.pot += newPlayer.chips;
                newPlayer.bet += newPlayer.chips;
                newPlayer.chips = 0;
                newPlayer.state = 'all-in';
            }
            else {
                newState.pot += callAmount;
                newPlayer.chips -= callAmount;
                newPlayer.bet += callAmount;
            }
            newPlayer.hasActedThisRound = true;
            break;
        case 'raise':
            if (amount === undefined || amount === null)
                throw new Error("Raise amount required");
            const raiseAmount = Number(amount);
            if (isNaN(raiseAmount) || raiseAmount <= 0)
                throw new Error("Invalid raise amount");
            if (raiseAmount <= newState.currentBet) {
                throw new Error("Raise amount must be strictly greater than current bet");
            }
            const additionalChips = raiseAmount - newPlayer.bet;
            if (additionalChips > newPlayer.chips) {
                throw new Error("Not enough chips to raise that amount");
            }
            // Min raise logic: double current bet
            const minRaise = newState.currentBet > 0 ? newState.currentBet * 2 : state.bigBlind;
            if (raiseAmount < minRaise && additionalChips < newPlayer.chips) {
                throw new Error(`Raise must be at least ${minRaise} or all-in`);
            }
            newState.pot += additionalChips;
            newPlayer.chips -= additionalChips;
            newPlayer.bet = raiseAmount;
            newState.currentBet = raiseAmount;
            if (newPlayer.chips === 0) {
                newPlayer.state = 'all-in';
            }
            // Mark other active players as needing to act again since bet increased
            newState.players.forEach((p, idx) => {
                if (idx !== playerIndex && p.state === 'active') {
                    p.hasActedThisRound = false;
                }
            });
            newPlayer.hasActedThisRound = true;
            break;
        default:
            throw new Error("Invalid action");
    }
    // advance turn
    newState.activePlayerIndex = (0, exports.getNextActivePlayerIndex)(newState);
    return newState;
};
exports.handlePlayerAction = handlePlayerAction;
const getNextActivePlayerIndex = (state) => {
    let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
    let loops = 0;
    // Skip anyone who is not currently active (waiting, folded, or all-in)
    while (state.players[nextIndex].state !== 'active' && loops < state.players.length) {
        nextIndex = (nextIndex + 1) % state.players.length;
        loops++;
    }
    return nextIndex;
};
exports.getNextActivePlayerIndex = getNextActivePlayerIndex;
const isRoundComplete = (state) => {
    const activePlayers = state.players.filter(p => p.state === 'active');
    if (activePlayers.length <= 1)
        return true; // only one active player remains or none
    // every active player must have acted at least once AND matched the current bet
    return activePlayers.every(p => p.hasActedThisRound && p.bet === state.currentBet);
};
exports.isRoundComplete = isRoundComplete;
