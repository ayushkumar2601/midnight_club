import { Server, Socket } from 'socket.io';
import { getRoom } from '../rooms/roomManager';
import { handlePlayerAction } from '../engine/bettingEngine';
import { ActionPayload } from '../types';
import { recordEvent } from '../midnight/replay';
import { progressGameState } from '../engine/botEngine';

export const handleAction = (io: Server, socket: Socket, { roomId, playerId, payload }: { roomId: string, playerId: string, payload: ActionPayload }) => {
  const room = getRoom(roomId);
  if (!room) return;

  try {
    room.gameState = handlePlayerAction(room.gameState, playerId, payload);
    
    // Generate Action Proof
    const actionProof = {
      type: 'ACTION' as const,
      proofBytes: `ACTION_PROOF_${Date.now()}_${playerId}_${payload.action}`,
      publicInputs: [playerId, payload.action, room.gameState.pot]
    };
    recordEvent(roomId, { timestamp: Date.now(), type: 'ACTION', proof: actionProof, publicInputs: actionProof.publicInputs });

    // Tick the central state machine to progress round, run bot turns, or showdown
    progressGameState(io, roomId);
    
  } catch (err: any) {
    socket.emit('error', err.message);
  }
};
