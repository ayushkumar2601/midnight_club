"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShuffleProof = exports.provableShuffle = exports.generateSecureSeed = exports.generateCommitment = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a SHA-256 hash commitment for a given set of data and a secret salt.
 * Used to commit to a deck order or player hand without revealing it.
 */
const generateCommitment = (data, salt) => {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(JSON.stringify(data) + salt);
    return hash.digest('hex');
};
exports.generateCommitment = generateCommitment;
/**
 * Generates secure randomness for shuffling using Node's crypto module.
 * In Midnight, this would be handled via decentralized RNG or a commit-reveal scheme.
 */
const generateSecureSeed = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateSecureSeed = generateSecureSeed;
/**
 * Deterministically shuffles a deck based on a secure seed.
 * This ensures the shuffle is provable and reproducible within a ZK circuit.
 */
const provableShuffle = (deck, seed) => {
    const shuffled = [...deck];
    // Seeded PRNG mock using crypto hash for deterministic permutation
    let currentSeed = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
        const hash = crypto_1.default.createHash('sha256').update(currentSeed).digest('hex');
        const j = parseInt(hash.substring(0, 8), 16) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        currentSeed = hash; // advance the PRNG
    }
    return shuffled;
};
exports.provableShuffle = provableShuffle;
/**
 * Simulates generating a ZK proof for the shuffle.
 */
const generateShuffleProof = (originalDeck, shuffledDeck, seed) => {
    // In a real Midnight contract, this compiles into a compact proof of permutation
    return Buffer.from(`SHUFFLE_PROOF_${Date.now()}_${seed.substring(0, 8)}`).toString('base64');
};
exports.generateShuffleProof = generateShuffleProof;
