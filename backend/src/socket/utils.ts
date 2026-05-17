import { Server } from 'socket.io';

export const emitPublicState = (io: Server, roomId: string, state: any) => {
  const clients = io.sockets.adapter.rooms.get(roomId);
  
  if (clients && clients.size > 0) {
    for (const socketId of clients) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        // Deep copy the state for this client
        const clientState = JSON.parse(JSON.stringify(state));
        delete clientState.midnightState.privateState;

        const recipientPlayerId = socket.data?.playerId;

        // Strip cards for other players, keep them for this player (unless showdown, where we show all)
        clientState.players.forEach((p: any) => {
          if (clientState.round !== 'showdown' && p.id !== recipientPlayerId) {
            p.cards = [];
          }
        });

        socket.emit('syncState', clientState);
      }
    }
  } else {
    // Fallback broadcast
    const publicState = JSON.parse(JSON.stringify(state));
    delete publicState.midnightState.privateState;
    publicState.players.forEach((p: any) => {
      if (state.round !== 'showdown') {
        p.cards = [];
      }
    });
    io.to(roomId).emit('syncState', publicState);
  }
};
