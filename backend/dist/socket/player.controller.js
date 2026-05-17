"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAction = void 0;
const roomManager_1 = require("../rooms/roomManager");
const bettingEngine_1 = require("../engine/bettingEngine");
const replay_1 = require("../midnight/replay");
const botEngine_1 = require("../engine/botEngine");
const handleAction = (io, socket, { roomId, playerId, payload }) => {
    const room = (0, roomManager_1.getRoom)(roomId);
    if (!room)
        return;
    try {
        room.gameState = (0, bettingEngine_1.handlePlayerAction)(room.gameState, playerId, payload);
        // Generate Action Proof
        const actionProof = {
            type: 'ACTION',
            proofBytes: `ACTION_PROOF_${Date.now()}_${playerId}_${payload.action}`,
            publicInputs: [playerId, payload.action, room.gameState.pot]
        };
        (0, replay_1.recordEvent)(roomId, { timestamp: Date.now(), type: 'ACTION', proof: actionProof, publicInputs: actionProof.publicInputs });
        // Tick the central state machine to progress round, run bot turns, or showdown
        (0, botEngine_1.progressGameState)(io, roomId);
    }
    catch (err) {
        socket.emit('error', err.message);
    }
};
exports.handleAction = handleAction;
