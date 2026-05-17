"use client";

import { useEffect, useState, ReactNode } from 'react';
import { socket } from './socket';
import { useGameStore } from '../stores/useGameStore';

export function SocketProvider({ children }: { children: ReactNode }) {
  const setGameState = useGameStore((state) => state.setGameState);
  const setLastProof = useGameStore((state) => state.setLastProof);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Midnight Poker Engine:', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('syncState', (state) => {
      setGameState(state);
    });

    socket.on('syncPrivateCards', ({ playerId, cards }) => {
      useGameStore.getState().setPrivateCards(playerId, cards);
    });

    socket.on('showdown', (data) => {
      // data contains results, winnerId, pot, proof
      setLastProof(data.proof);
      console.log("Showdown Data:", data);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setConnectionStatus('connected');
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Reconnection attempt #', attemptNumber);
      setConnectionStatus('connecting');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setConnectionStatus('disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('syncState');
      socket.off('syncPrivateCards');
      socket.off('showdown');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [setGameState, setLastProof]);

  return <>{children}</>;
}
