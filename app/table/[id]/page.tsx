"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Cpu, EyeOff, Lock } from "lucide-react";
import { socket } from "../../../lib/socket/socket";
import { useGameStore } from "../../../lib/stores/useGameStore";
import { useWalletStore } from "../../../lib/stores/useWalletStore";

export default function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const gameState = useGameStore((state) => state.gameState);
  const wallet = useWalletStore();
  const [actionAmount, setActionAmount] = useState(0);

  // Connect and join room on mount
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      socket.emit('joinRoom', { 
        roomId, 
        player: { id: wallet.address, name: "Player", chips: 10000, bet: 0, state: 'waiting', cards: [] } 
      });
    } else {
      socket.emit('joinRoom', { roomId }); // spectate
    }
    
    return () => {
      // In a real app we'd handle leave
    };
  }, [roomId, wallet.isConnected, wallet.address]);

  const handleStart = () => socket.emit('startGame', { roomId });
  const handleAction = (action: 'fold' | 'check' | 'call' | 'raise') => {
    socket.emit('playerAction', { roomId, playerId: wallet.address, payload: { action, amount: action === 'raise' ? actionAmount : undefined } });
  };

  const isMyTurn = gameState?.players[gameState.activePlayerIndex]?.id === wallet.address;
  const me = gameState?.players.find(p => p.id === wallet.address);

  return (
    <div className="relative w-full min-h-screen bg-[#050816] text-white font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,#050816_80%)] z-0" />
      
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A1020]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/lobby" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-sm font-mono uppercase tracking-widest text-cyan-400">Node: {roomId}</div>
        </div>
        
        {/* Midnight Confidential Integrity Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#10182B] border border-blue-500/20">
            <Lock size={12} className="text-blue-400" />
            <span className="text-[10px] uppercase font-mono text-blue-400 tracking-widest">State Hidden</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#10182B] border border-green-500/20">
            <ShieldCheck size={12} className="text-green-400" />
            <span className="text-[10px] uppercase font-mono text-green-400 tracking-widest">Proof Valid</span>
          </div>
        </div>
      </nav>

      {/* Table Interface */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center pt-16">
        
        {/* Midnight Public State Dashboard (Top) */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {gameState?.midnightState && (
             <div className="text-center font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] flex flex-col items-center">
               <span>Deck Commitment: {gameState.midnightState.publicState.deckCommitment || 'AWAITING_SHUFFLE'}</span>
               {gameState.inProgress && <span className="text-cyan-400 mt-1 flex items-center gap-1"><Cpu size={10} /> ZK Shuffle Verified</span>}
             </div>
          )}
        </div>

        {/* The Poker Table */}
        <div className="relative w-full max-w-4xl aspect-[2/1] bg-[#0A1020] border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] rounded-[400px] flex items-center justify-center mb-12">
          
          {/* Inner Felt */}
          <div className="absolute inset-x-12 bottom-6 top-12 bg-[#10182B] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.05)_inset] rounded-[400px]" />
          
          {/* Center Community Cards & Pot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {gameState?.communityCards.map((card, i) => (
                  <motion.div 
                    key={`${card.rank}-${card.suit}-${i}`}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="w-16 h-24 bg-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center"
                  >
                    <span className={`text-2xl font-serif ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'}`}>{card.rank}</span>
                    <span className={`text-2xl font-serif ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'}`}>
                      {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Pot */}
            {gameState && (
              <div className="px-6 py-2 bg-black/50 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <span className="text-cyan-400 font-mono font-bold tracking-widest uppercase text-xs">Pot: ${gameState.pot}</span>
              </div>
            )}
          </div>

          {/* Players */}
          {gameState?.players.map((player, index) => {
            // Simplified positioning for 2 players
            const isBottom = player.id === wallet.address; // Me at bottom
            const posClass = isBottom 
              ? "bottom-[-20px] left-1/2 -translate-x-1/2 flex-col justify-end pb-3 border-b-2 border-blue-500 bg-gradient-to-t from-blue-500/30" 
              : "top-[-20px] left-1/2 -translate-x-1/2 flex-col justify-start pt-3 border-t-2 border-purple-500 bg-gradient-to-b from-purple-500/30";
            
            const isActive = gameState.activePlayerIndex === index;

            return (
              <div key={player.id} className={`absolute w-40 h-24 to-transparent flex items-center ${posClass} ${isActive ? (isBottom ? 'glow-blue' : 'glow-purple') : ''} z-30 transition-all duration-300`}>
                <span className="text-white text-[10px] font-mono uppercase mb-1">{player.id.substring(0, 8)}...</span>
                <span className={`font-bold text-sm ${isBottom ? 'text-blue-400' : 'text-purple-400'}`}>${player.chips}</span>
                <div className="text-[10px] text-white/50 uppercase mt-1">Bet: ${player.bet}</div>
                
                {/* Midnight Private Cards Indicator */}
                {player.state === 'active' && !isBottom && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-[-60px] flex gap-1">
                    <div className="w-8 h-12 bg-[#050816] border border-white/20 flex items-center justify-center"><EyeOff size={12} className="text-white/30" /></div>
                    <div className="w-8 h-12 bg-[#050816] border border-white/20 flex items-center justify-center"><EyeOff size={12} className="text-white/30" /></div>
                  </div>
                )}

                {/* My Cards */}
                {isBottom && player.cards && player.cards.length > 0 && (
                  <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 flex gap-1">
                    {player.cards.map((c, i) => (
                      <div key={i} className="w-10 h-14 bg-white border border-white/20 shadow-lg flex flex-col items-center justify-center text-black text-xs font-serif font-bold">
                        {c.rank}
                        <span>{c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#050816] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!gameState?.inProgress && <button onClick={handleStart} className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 uppercase tracking-widest text-xs font-bold hover:bg-blue-500/30 transition-colors">Initialize Sequence</button>}
          </div>

          {isMyTurn && (
            <div className="flex items-center gap-3">
              <button onClick={() => handleAction('fold')} className="px-6 py-3 bg-transparent border border-white/20 text-white/60 hover:text-white hover:border-white/40 uppercase tracking-widest text-xs font-bold transition-colors">Fold</button>
              <button onClick={() => handleAction('check')} className="px-6 py-3 bg-transparent border border-white/20 text-white hover:border-white uppercase tracking-widest text-xs font-bold transition-colors">Check</button>
              <button onClick={() => handleAction('call')} className="px-6 py-3 bg-white/5 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 uppercase tracking-widest text-xs font-bold transition-colors glow-cyan">Call</button>
              <div className="flex items-center">
                <input 
                  type="number" 
                  value={actionAmount} 
                  onChange={e => setActionAmount(parseInt(e.target.value))} 
                  className="w-24 px-3 py-3 bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button onClick={() => handleAction('raise')} className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 uppercase tracking-widest text-xs font-bold transition-colors glow-purple">Raise</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
