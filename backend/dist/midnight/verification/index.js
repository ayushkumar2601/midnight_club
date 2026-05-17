"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventReplayAttack = exports.verifyShowdownProof = exports.verifyActionProof = exports.verifyShuffleProof = void 0;
/**
 * Simulates the verification of a ZK proof against the public inputs.
 * In a real Midnight application, this would call the Midnight DApp SDK to verify the proof against the deployed contract.
 */
const verifyShuffleProof = (proof, oldDeckCommitment, newDeckCommitment) => {
    // Mock verification: Ensure proofBytes exists and public inputs match
    if (!proof.proofBytes.startsWith('SHUFFLE_PROOF_'))
        return false;
    if (proof.publicInputs[0] !== oldDeckCommitment || proof.publicInputs[1] !== newDeckCommitment)
        return false;
    return true;
};
exports.verifyShuffleProof = verifyShuffleProof;
/**
 * Verifies that a player's action (fold, call, raise) is legal given their hidden chip balance.
 */
const verifyActionProof = (proof, playerId, currentBet) => {
    // Mock verification
    if (!proof.proofBytes.startsWith('ACTION_PROOF_'))
        return false;
    // A real contract verifies that the action doesn't dip the hidden balance below 0, etc.
    return true;
};
exports.verifyActionProof = verifyActionProof;
/**
 * Verifies the final showdown proofs, ensuring the revealed cards correspond to the previously committed hash.
 */
const verifyShowdownProof = (proof, handCommitment) => {
    if (!proof.proofBytes.startsWith('SHOWDOWN_PROOF_'))
        return false;
    // It would hash the revealedCards and check if they equal handCommitment.
    // For the mock, we assume it succeeds if the proof is correctly formatted.
    return true;
};
exports.verifyShowdownProof = verifyShowdownProof;
/**
 * Anti-cheat hook that checks for replay attacks by ensuring proof nonces or unique identifiers haven't been used.
 */
const usedProofs = new Set();
const preventReplayAttack = (proofBytes) => {
    if (usedProofs.has(proofBytes))
        return false;
    usedProofs.add(proofBytes);
    return true;
};
exports.preventReplayAttack = preventReplayAttack;
