"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCards = exports.shuffleDeck = exports.createDeck = void 0;
const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};
exports.createDeck = createDeck;
// Deterministic shuffle logic will be needed if we provide a seed, 
// but for standard gameplay we use Math.random() or crypto. 
// A simple Fisher-Yates shuffle:
const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleDeck = shuffleDeck;
const drawCards = (deck, count) => {
    return deck.splice(0, count);
};
exports.drawCards = drawCards;
