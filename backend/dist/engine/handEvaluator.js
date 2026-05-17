"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineWinner = exports.evaluateHand = void 0;
const rankValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};
const getKickerScore = (vals) => {
    let s = 0;
    let mult = 1;
    for (let i = vals.length - 1; i >= 0; i--) {
        s += vals[i] * mult;
        mult *= 15;
    }
    return s;
};
const evaluateHand = (holeCards, communityCards) => {
    const allCards = [...holeCards, ...communityCards];
    if (allCards.length === 0)
        return { rank: 'High Card', score: 0 };
    const cardVals = allCards.map(c => rankValues[c.rank]).sort((a, b) => b - a);
    // Group counts
    const counts = {};
    cardVals.forEach(v => counts[v] = (counts[v] || 0) + 1);
    // Check Flush
    const suitCounts = {};
    allCards.forEach(c => {
        suitCounts[c.suit] = suitCounts[c.suit] || [];
        suitCounts[c.suit].push(c);
    });
    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit].length >= 5);
    const isFlush = !!flushSuit;
    // Check Straight
    const uniqueVals = Array.from(new Set(cardVals)).sort((a, b) => b - a);
    let isStraight = false;
    let straightHigh = 0;
    for (let i = 0; i <= uniqueVals.length - 5; i++) {
        if (uniqueVals[i] - uniqueVals[i + 4] === 4) {
            isStraight = true;
            straightHigh = uniqueVals[i];
            break;
        }
    }
    // Ace-low straight
    if (!isStraight && uniqueVals.includes(14) && uniqueVals.includes(5) && uniqueVals.includes(4) && uniqueVals.includes(3) && uniqueVals.includes(2)) {
        isStraight = true;
        straightHigh = 5;
    }
    // Straight Flush / Royal Flush check
    if (isFlush && flushSuit) {
        const flushCards = suitCounts[flushSuit].map(c => rankValues[c.rank]).sort((a, b) => b - a);
        const uniqueFlushVals = Array.from(new Set(flushCards));
        let hasSf = false;
        let sfHigh = 0;
        for (let i = 0; i <= uniqueFlushVals.length - 5; i++) {
            if (uniqueFlushVals[i] - uniqueFlushVals[i + 4] === 4) {
                hasSf = true;
                sfHigh = uniqueFlushVals[i];
                break;
            }
        }
        if (!hasSf && uniqueFlushVals.includes(14) && uniqueFlushVals.includes(5) && uniqueFlushVals.includes(4) && uniqueFlushVals.includes(3) && uniqueFlushVals.includes(2)) {
            hasSf = true;
            sfHigh = 5;
        }
        if (hasSf) {
            if (sfHigh === 14)
                return { rank: 'Royal Flush', score: 1000000 };
            return { rank: 'Straight Flush', score: 900000 + sfHigh };
        }
    }
    // Count groups
    const quads = Object.keys(counts).filter(k => counts[Number(k)] === 4).map(Number).sort((a, b) => b - a);
    const trips = Object.keys(counts).filter(k => counts[Number(k)] === 3).map(Number).sort((a, b) => b - a);
    const pairs = Object.keys(counts).filter(k => counts[Number(k)] === 2).map(Number).sort((a, b) => b - a);
    // 1. Four of a Kind
    if (quads.length > 0) {
        const q = quads[0];
        const kicker = cardVals.find(v => v !== q) || 0;
        return { rank: 'Four of a Kind', score: 800000 + q * 15 + kicker };
    }
    // 2. Full House
    if (trips.length > 0 && (trips.length > 1 || pairs.length > 0)) {
        const t = trips[0];
        const p = trips.length > 1 ? trips[1] : pairs[0];
        return { rank: 'Full House', score: 700000 + t * 15 + p };
    }
    // 3. Flush
    if (isFlush && flushSuit) {
        const flushVals = suitCounts[flushSuit].map(c => rankValues[c.rank]).sort((a, b) => b - a).slice(0, 5);
        return { rank: 'Flush', score: 600000 + getKickerScore(flushVals) };
    }
    // 4. Straight
    if (isStraight) {
        return { rank: 'Straight', score: 500000 + straightHigh };
    }
    // 5. Three of a Kind
    if (trips.length > 0) {
        const t = trips[0];
        const kickers = cardVals.filter(v => v !== t).slice(0, 2);
        return { rank: 'Three of a Kind', score: 400000 + t * 225 + getKickerScore(kickers) };
    }
    // 6. Two Pair
    if (pairs.length >= 2) {
        const p1 = pairs[0];
        const p2 = pairs[1];
        const kicker = cardVals.find(v => v !== p1 && v !== p2) || 0;
        return { rank: 'Two Pair', score: 300000 + p1 * 225 + p2 * 15 + kicker };
    }
    // 7. Pair
    if (pairs.length > 0) {
        const p = pairs[0];
        const kickers = cardVals.filter(v => v !== p).slice(0, 3);
        return { rank: 'Pair', score: 200000 + p * 3375 + getKickerScore(kickers) };
    }
    // 8. High Card
    const top5 = cardVals.slice(0, 5);
    return { rank: 'High Card', score: 100000 + getKickerScore(top5) };
};
exports.evaluateHand = evaluateHand;
const determineWinner = (players, communityCards) => {
    const activePlayers = players.filter(p => p.state !== 'folded' && p.state !== 'waiting');
    const results = activePlayers.map(p => {
        const { rank, score } = (0, exports.evaluateHand)(p.cards, communityCards);
        return { playerId: p.id, rank, score };
    });
    results.sort((a, b) => b.score - a.score);
    return results; // Return ordered by best hand
};
exports.determineWinner = determineWinner;
