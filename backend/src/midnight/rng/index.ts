import crypto from 'crypto';
import { Card } from '../../types';

/**
 * Generates a SHA-256 hash commitment for a given set of data and a secret salt.
 * Used to commit to a deck order or player hand without revealing it.
 */
export const generateCommitment = (data: any, salt: string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data) + salt);
  return hash.digest('hex');
};

/**
 * Generates secure randomness for shuffling using Node's crypto module.
 * In Midnight, this would be handled via decentralized RNG or a commit-reveal scheme.
 */
export const generateSecureSeed = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Deterministically shuffles a deck based on a secure seed.
 * This ensures the shuffle is provable and reproducible within a ZK circuit.
 */
export const provableShuffle = (deck: Card[], seed: string): Card[] => {
  const shuffled = [...deck];
  // Seeded PRNG mock using crypto hash for deterministic permutation
  let currentSeed = seed;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const hash = crypto.createHash('sha256').update(currentSeed).digest('hex');
    const j = parseInt(hash.substring(0, 8), 16) % (i + 1);
    
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    currentSeed = hash; // advance the PRNG
  }
  
  return shuffled;
};

/**
 * Simulates generating a ZK proof for the shuffle.
 */
export const generateShuffleProof = (originalDeck: Card[], shuffledDeck: Card[], seed: string): string => {
  // In a real Midnight contract, this compiles into a compact proof of permutation
  return Buffer.from(`SHUFFLE_PROOF_${Date.now()}_${seed.substring(0, 8)}`).toString('base64');
};
