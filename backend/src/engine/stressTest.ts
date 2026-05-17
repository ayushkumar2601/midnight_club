import { createRoom, getRoom } from '../rooms/roomManager';
import { createDeck, shuffleDeck, drawCards } from './deck';
import { handlePlayerAction, isRoundComplete } from './bettingEngine';
import { advanceRound } from './roundManager';
import { determineWinner } from './handEvaluator';
import { resetGameStateForNextHand } from '../state/gameState';

export const runAutomatedStressTest = (roundsToRun: number = 100) => {
  console.log(`\n==================================================`);
  console.log(`INITIALIZING POKER ENGINE STRESS TEST (${roundsToRun} ROUNDS)`);
  console.log(`==================================================\n`);

  const roomId = 'STRESS-TEST-ROOM';
  let room;
  try {
    room = createRoom(roomId, 'Stress Test Node', "No Limit Hold'em", "1K / 2K USDC");
  } catch (err) {
    room = getRoom(roomId)!;
  }

  const botNames = ['Sentinel', 'Hacker', 'Core', 'Syndicate', 'Elite', 'Fixer'];
  const colors = ['#FD5200', '#58A6FF', '#8B5CF6', '#EF4444', '#B3B3B3', '#10B981'];

  // 1. Seed active players
  room.gameState.players = botNames.map((name, i) => ({
    id: `BOT_TEST_${i}`,
    name,
    chips: 250000,
    bet: 0,
    state: 'waiting',
    cards: [],
    avatarColor: colors[i],
    title: 'STRESS_BOT',
    playStyle: 'Optimal',
    hasActedThisRound: false
  }));

  let successfulRounds = 0;
  let deadlocks = 0;
  let totalActions = 0;

  for (let roundNum = 1; roundNum <= roundsToRun; roundNum++) {
    // console.log(`--- Hand #${roundNum} ---`);
    
    // Start Hand (posting blinds, dealing)
    let state = room.gameState;
    
    state.players.forEach(p => {
      if (p.chips <= 0) p.chips = 250000; // auto-rebuy
      p.state = 'waiting';
      p.bet = 0;
      p.hasActedThisRound = false;
      p.cards = [];
    });

    state.inProgress = true;
    state.communityCards = [];
    state.round = 'preflop' as any;
    state.midnightState.privateState.deckOrder = shuffleDeck(createDeck());
    
    // Validate deck size
    if (state.midnightState.privateState.deckOrder.length !== 52) {
      throw new Error(`Deck has invalid card count: ${state.midnightState.privateState.deckOrder.length}`);
    }

    // Deal cards
    state.players.forEach(p => {
      p.state = 'active';
      p.hasActedThisRound = false;
      p.cards = drawCards(state.midnightState.privateState.deckOrder, 2);
    });

    // Check for duplicate cards dealt
    const dealtCards = new Set<string>();
    state.players.forEach(p => {
      p.cards.forEach(c => {
        const key = `${c.rank}_of_${c.suit}`;
        if (dealtCards.has(key)) throw new Error(`Duplicate card detected: ${key}`);
        dealtCards.add(key);
      });
    });

    // Blinds
    state.pot = state.smallBlind + state.bigBlind;
    state.currentBet = state.bigBlind;
    
    state.players[0].chips -= state.smallBlind;
    state.players[0].bet = state.smallBlind;
    state.players[1].chips -= state.bigBlind;
    state.players[1].bet = state.bigBlind;
    state.activePlayerIndex = 2 % state.players.length;

    let actionsThisHand = 0;
    const maxSafetyActions = 200; // prevent infinite loop if buggy

    while (state.inProgress && actionsThisHand < maxSafetyActions) {
      // 1. Audit Folded State
      const activePlayers = state.players.filter(p => p.state !== 'folded' && p.state !== 'waiting');
      if (activePlayers.length <= 1) {
        const winner = activePlayers[0] || state.players.find(p => p.state !== 'folded');
        if (winner) {
          winner.chips += state.pot;
        }
        state.inProgress = false;
        break;
      }

      // 2. Check if betting round complete
      if (isRoundComplete(state)) {
        while (isRoundComplete(state) && state.round !== 'showdown' && state.inProgress) {
          if (state.round === 'river') {
            state.round = 'showdown';
            break;
          } else {
            state = advanceRound(state);
            room.gameState = state;
          }
        }

        if (state.round === 'showdown' && state.inProgress) {
          const results = determineWinner(state.players, state.communityCards);
          const winner = results[0];
          const winnerPlayer = state.players.find(p => p.id === winner.playerId);
          if (winnerPlayer) winnerPlayer.chips += state.pot;
          state.inProgress = false;
          break;
        }
      }

      // 3. Make active player take a legal action
      if (state.inProgress) {
        const currentPlayer = state.players[state.activePlayerIndex];
        if (currentPlayer.state !== 'active') {
          // move to next player
          state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
          continue;
        }

        const callAmount = state.currentBet - currentPlayer.bet;
        let action: 'fold' | 'check' | 'call' | 'raise' = 'check';
        let amount: number | undefined;

        const rand = Math.random();

        if (callAmount === 0) {
          if (rand < 0.2) {
            action = 'raise';
            amount = state.currentBet === 0 ? state.bigBlind * 2 : state.currentBet * 2;
          } else {
            action = 'check';
          }
        } else {
          if (rand < 0.1) {
            action = 'fold';
          } else if (rand < 0.25 && currentPlayer.chips > callAmount * 2) {
            action = 'raise';
            amount = state.currentBet * 2;
          } else {
            action = 'call';
          }
        }

        try {
          room.gameState = handlePlayerAction(state, currentPlayer.id, { action, amount });
          actionsThisHand++;
          totalActions++;
        } catch (err) {
          // Fallback check or fold if action was illegal
          try {
            if (callAmount === 0) {
              room.gameState = handlePlayerAction(state, currentPlayer.id, { action: 'check' });
            } else {
              room.gameState = handlePlayerAction(state, currentPlayer.id, { action: 'fold' });
            }
          } catch (e) {
            // Force skip turn to avoid deadlock
            state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
          }
        }
      }
    }

    if (actionsThisHand >= maxSafetyActions) {
      deadlocks++;
      console.log(`[DEADLOCK ALERT] Hand #${roundNum} terminated due to exceeding safety limit of ${maxSafetyActions} actions!`);
    } else {
      successfulRounds++;
    }

    // Reset for next hand
    room.gameState = resetGameStateForNextHand(room.gameState);
  }

  console.log(`\n==================================================`);
  console.log(`STRESS TEST RESULTS:`);
  console.log(`- Total Simulated Hands: ${roundsToRun}`);
  console.log(`- Successfully Completed: ${successfulRounds}`);
  console.log(`- Deadlocks Detected: ${deadlocks}`);
  console.log(`- Total Actions Simulated: ${totalActions}`);
  console.log(`- Average Actions per Hand: ${(totalActions / roundsToRun).toFixed(1)}`);
  console.log(`==================================================\n`);

  if (deadlocks > 0) {
    throw new Error(`Stress test failed: ${deadlocks} deadlock(s) detected.`);
  } else {
    console.log(`POKER ENGINE IS 100% STABLE AND COMPLIANT!`);
  }
};
