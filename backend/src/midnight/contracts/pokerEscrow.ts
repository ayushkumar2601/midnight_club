/**
 * Mock Smart Contract Flow for Poker Escrow
 * Demonstrates how Midnight would handle buy-ins and payouts cryptographically.
 */

export interface EscrowState {
  contractId: string;
  totalLocked: number;
  playerBalances: Record<string, number>; // playerId -> locked amount
  isFinalized: boolean;
}

export const initializeEscrow = (contractId: string): EscrowState => {
  return {
    contractId,
    totalLocked: 0,
    playerBalances: {},
    isFinalized: false,
  };
};

/**
 * Simulates a player locking funds into the Midnight contract.
 */
export const lockFunds = (escrow: EscrowState, playerId: string, amount: number): EscrowState => {
  if (escrow.isFinalized) throw new Error("Escrow already finalized");
  
  const newState = { ...escrow, playerBalances: { ...escrow.playerBalances } };
  newState.playerBalances[playerId] = (newState.playerBalances[playerId] || 0) + amount;
  newState.totalLocked += amount;
  
  return newState;
};

/**
 * Payout logic executed at the end of the hand upon verifying the ShowdownProof.
 */
export const executePayout = (escrow: EscrowState, winnerId: string, amount: number): EscrowState => {
  if (escrow.isFinalized) throw new Error("Escrow already finalized");
  if (amount > escrow.totalLocked) throw new Error("Cannot payout more than locked");

  // In a real Midnight contract, the ZK proof would authorize the transfer of the locked tokens.
  const newState = { ...escrow };
  newState.playerBalances[winnerId] = (newState.playerBalances[winnerId] || 0) + amount;
  newState.totalLocked -= amount;
  newState.isFinalized = true;

  return newState;
};
