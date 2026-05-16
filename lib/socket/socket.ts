import { io, Socket } from 'socket.io-client';

// Use standard port 4000 defined in our backend
export const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: false,
});
