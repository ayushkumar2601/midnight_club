"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeline = exports.revalidateTimeline = exports.recordEvent = void 0;
const verification_1 = require("../verification");
const memoryTimelines = {};
/**
 * Records a proof event into the game's timeline for later replay and anti-cheat auditing.
 */
const recordEvent = (gameId, event) => {
    if (!memoryTimelines[gameId]) {
        memoryTimelines[gameId] = { gameId, events: [] };
    }
    memoryTimelines[gameId].events.push(event);
};
exports.recordEvent = recordEvent;
/**
 * Re-validates an entire game timeline from start to finish.
 * This is crucial for the hackathon demo to prove fairness after the game ends.
 */
const revalidateTimeline = (gameId) => {
    const timeline = memoryTimelines[gameId];
    if (!timeline)
        throw new Error("Timeline not found");
    for (let i = 0; i < timeline.events.length; i++) {
        const event = timeline.events[i];
        let valid = false;
        switch (event.type) {
            case 'SHUFFLE':
                valid = (0, verification_1.verifyShuffleProof)(event.proof, event.publicInputs[0], event.publicInputs[1]);
                break;
            case 'ACTION':
                valid = (0, verification_1.verifyActionProof)(event.proof, event.publicInputs[0], event.publicInputs[1]);
                break;
            case 'SHOWDOWN':
                valid = (0, verification_1.verifyShowdownProof)(event.proof, event.publicInputs[0]);
                break;
        }
        if (!valid) {
            return { isValid: false, failedEventIndex: i };
        }
    }
    return { isValid: true, failedEventIndex: -1 };
};
exports.revalidateTimeline = revalidateTimeline;
const getTimeline = (gameId) => {
    return memoryTimelines[gameId];
};
exports.getTimeline = getTimeline;
