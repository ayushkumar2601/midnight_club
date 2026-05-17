"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitPublicState = void 0;
const emitPublicState = (io, roomId, state) => {
    // Strip private state
    const publicState = JSON.parse(JSON.stringify(state));
    delete publicState.midnightState.privateState;
    // Also strip player cards if they aren't revealed
    publicState.players.forEach((p) => {
        // Only emit cards at showdown, otherwise hide them
        if (state.round !== 'showdown') {
            p.cards = [];
        }
    });
    io.to(roomId).emit('syncState', publicState);
};
exports.emitPublicState = emitPublicState;
