import { ActionProof, Proof, ShowdownProof, ShuffleProof } from '../types';
import { verifyActionProof, verifyShowdownProof, verifyShuffleProof } from '../verification';

export interface GameEvent {
  timestamp: number;
  type: 'SHUFFLE' | 'ACTION' | 'SHOWDOWN';
  proof: Proof;
  publicInputs: any[];
}

export interface ReplayTimeline {
  gameId: string;
  events: GameEvent[];
}

const memoryTimelines: Record<string, ReplayTimeline> = {};

/**
 * Records a proof event into the game's timeline for later replay and anti-cheat auditing.
 */
export const recordEvent = (gameId: string, event: GameEvent) => {
  if (!memoryTimelines[gameId]) {
    memoryTimelines[gameId] = { gameId, events: [] };
  }
  memoryTimelines[gameId].events.push(event);
};

/**
 * Re-validates an entire game timeline from start to finish.
 * This is crucial for the hackathon demo to prove fairness after the game ends.
 */
export const revalidateTimeline = (gameId: string): { isValid: boolean, failedEventIndex: number } => {
  const timeline = memoryTimelines[gameId];
  if (!timeline) throw new Error("Timeline not found");

  for (let i = 0; i < timeline.events.length; i++) {
    const event = timeline.events[i];
    let valid = false;

    switch (event.type) {
      case 'SHUFFLE':
        valid = verifyShuffleProof(
          event.proof as ShuffleProof, 
          event.publicInputs[0], 
          event.publicInputs[1]
        );
        break;
      case 'ACTION':
        valid = verifyActionProof(
          event.proof as ActionProof,
          event.publicInputs[0],
          event.publicInputs[1]
        );
        break;
      case 'SHOWDOWN':
        valid = verifyShowdownProof(
          event.proof as ShowdownProof,
          event.publicInputs[0]
        );
        break;
    }

    if (!valid) {
      return { isValid: false, failedEventIndex: i };
    }
  }

  return { isValid: true, failedEventIndex: -1 };
};

export const getTimeline = (gameId: string): ReplayTimeline | undefined => {
  return memoryTimelines[gameId];
};
