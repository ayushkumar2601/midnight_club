"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateFoldScenario = exports.simulateFlushScenario = void 0;
const handEvaluator_1 = require("../engine/handEvaluator");
const bettingEngine_1 = require("../engine/bettingEngine");
const gameState_1 = require("../state/gameState");
const mockPlayer = (id, name, chips) => ({
    id, name, chips, bet: 0, state: 'waiting', cards: []
});
const simulateFlushScenario = () => {
    console.log("--- Simulating Flush Scenario ---");
    const p1 = mockPlayer('1', 'Alice', 1000);
    const p2 = mockPlayer('2', 'Bob', 1000);
    p1.state = 'active';
    p2.state = 'active';
    p1.cards = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'hearts', rank: 'K' }
    ];
    p2.cards = [
        { suit: 'spades', rank: 'A' },
        { suit: 'spades', rank: 'K' }
    ];
    const communityCards = [
        { suit: 'hearts', rank: '2' },
        { suit: 'hearts', rank: '7' },
        { suit: 'hearts', rank: '9' },
        { suit: 'clubs', rank: '2' },
        { suit: 'diamonds', rank: '3' }
    ];
    const results = (0, handEvaluator_1.determineWinner)([p1, p2], communityCards);
    console.log("Winner Results:", results);
};
exports.simulateFlushScenario = simulateFlushScenario;
const simulateFoldScenario = () => {
    console.log("--- Simulating Fold Scenario ---");
    let state = (0, gameState_1.createInitialGameState)();
    state.players = [
        mockPlayer('1', 'Alice', 1000),
        mockPlayer('2', 'Bob', 1000)
    ];
    state.players[0].state = 'active';
    state.players[1].state = 'active';
    state.inProgress = true;
    state.activePlayerIndex = 0;
    console.log("Alice Folds");
    state = (0, bettingEngine_1.handlePlayerAction)(state, '1', { action: 'fold' });
    console.log("Alice State:", state.players[0].state);
    console.log("Is Round Complete:", state.players.filter(p => p.state === 'active').length <= 1);
};
exports.simulateFoldScenario = simulateFoldScenario;
// You can execute this file directly to test logic
if (require.main === module) {
    (0, exports.simulateFlushScenario)();
    (0, exports.simulateFoldScenario)();
}
