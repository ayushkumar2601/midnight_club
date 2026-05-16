import { Card, Player } from '../types';

export type HandRank = 
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandResult {
  playerId: string;
  rank: HandRank;
  score: number; // Simplified score to determine winner
}

const rankValues: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// Extremely simplified basic score evaluator for Phase 1. 
// A real poker engine would compare kickers recursively.
export const evaluateHand = (holeCards: Card[], communityCards: Card[]): { rank: HandRank, score: number } => {
  const allCards = [...holeCards, ...communityCards];
  
  if (allCards.length === 0) return { rank: 'High Card', score: 0 };

  const ranks = allCards.map(c => rankValues[c.rank]).sort((a, b) => b - a);
  const suits = allCards.map(c => c.suit);

  const rankCounts: Record<number, number> = {};
  ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);

  const suitCounts: Record<string, number> = {};
  suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);

  const isFlush = Object.values(suitCounts).some(count => count >= 5);
  
  // Straight detection
  const uniqueRanks = Array.from(new Set(ranks));
  let isStraight = false;
  let straightHigh = 0;
  
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i+4] === 4) {
      isStraight = true;
      straightHigh = uniqueRanks[i];
      break;
    }
  }

  // Handle Ace-low straight (A-2-3-4-5)
  if (!isStraight && uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    isStraight = true;
    straightHigh = 5;
  }

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  if (isStraight && isFlush) {
    if (straightHigh === 14) return { rank: 'Royal Flush', score: 1000000 };
    return { rank: 'Straight Flush', score: 900000 + straightHigh };
  }
  if (counts[0] === 4) return { rank: 'Four of a Kind', score: 800000 + ranks[0] };
  if (counts[0] === 3 && counts[1] >= 2) return { rank: 'Full House', score: 700000 + ranks[0] };
  if (isFlush) return { rank: 'Flush', score: 600000 + ranks[0] };
  if (isStraight) return { rank: 'Straight', score: 500000 + straightHigh };
  if (counts[0] === 3) return { rank: 'Three of a Kind', score: 400000 + ranks[0] };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair', score: 300000 + ranks[0] };
  if (counts[0] === 2) return { rank: 'Pair', score: 200000 + ranks[0] };
  
  return { rank: 'High Card', score: 100000 + ranks[0] };
};

export const determineWinner = (players: Player[], communityCards: Card[]): HandResult[] => {
  const activePlayers = players.filter(p => p.state !== 'folded' && p.state !== 'waiting');
  
  const results = activePlayers.map(p => {
    const { rank, score } = evaluateHand(p.cards, communityCards);
    return { playerId: p.id, rank, score };
  });

  results.sort((a, b) => b.score - a.score);
  return results; // Return ordered by best hand
};
