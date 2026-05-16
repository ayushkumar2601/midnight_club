"use client";

import { useEffect, ReactNode } from 'react';
import { socket } from './socket';
import { useGameStore } from '../stores/useGameStore';

export function SocketProvider({ children }: { children: ReactNode }) {
  const setGameState = useGameStore((state) => state.setGameState);
  const setLastProof = useGameStore((state) => state.setLastProof);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Midnight Poker Engine:', socket.id);
    });

    socket.on('syncState', (state) => {
      setGameState(state);
    });

    socket.on('showdown', (data) => {
      // data contains results, winnerId, pot, proof
      setLastProof(data.proof);
      console.log("Showdown Data:", data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [setGameState, setLastProof]);

  return <>{children}</>;
}
