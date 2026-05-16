import { Player, Card } from '../types';
import { evaluateHand, determineWinner } from '../engine/handEvaluator';
import { handlePlayerAction } from '../engine/bettingEngine';
import { createInitialGameState } from '../state/gameState';

const mockPlayer = (id: string, name: string, chips: number): Player => ({
  id, name, chips, bet: 0, state: 'waiting', cards: []
});

export const simulateFlushScenario = () => {
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

  const communityCards: Card[] = [
    { suit: 'hearts', rank: '2' },
    { suit: 'hearts', rank: '7' },
    { suit: 'hearts', rank: '9' },
    { suit: 'clubs', rank: '2' },
    { suit: 'diamonds', rank: '3' }
  ];

  const results = determineWinner([p1, p2], communityCards);
  console.log("Winner Results:", results);
};

export const simulateFoldScenario = () => {
  console.log("--- Simulating Fold Scenario ---");
  let state = createInitialGameState();
  state.players = [
    mockPlayer('1', 'Alice', 1000),
    mockPlayer('2', 'Bob', 1000)
  ];
  state.players[0].state = 'active';
  state.players[1].state = 'active';
  state.inProgress = true;
  state.activePlayerIndex = 0;

  console.log("Alice Folds");
  state = handlePlayerAction(state, '1', { action: 'fold' });
  console.log("Alice State:", state.players[0].state);
  console.log("Is Round Complete:", state.players.filter(p => p.state === 'active').length <= 1);
};

// You can execute this file directly to test logic
if (require.main === module) {
  simulateFlushScenario();
  simulateFoldScenario();
}
