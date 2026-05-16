"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Cpu, EyeOff, Lock, AlertCircle } from "lucide-react";
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
  }, [roomId, wallet.isConnected, wallet.address]);

  const handleStart = () => socket.emit('startGame', { roomId });
  const handleAction = (action: 'fold' | 'check' | 'call' | 'raise') => {
    socket.emit('playerAction', { roomId, playerId: wallet.address, payload: { action, amount: action === 'raise' ? actionAmount : undefined } });
  };

  const isMyTurn = gameState?.players[gameState.activePlayerIndex]?.id === wallet.address;
  const me = gameState?.players.find(p => p.id === wallet.address);

  // Determine if there is a winner for celebration overlay
  const [showdownData, setShowdownData] = useState<any>(null);
  useEffect(() => {
    const handleShowdown = (data: any) => {
      setShowdownData(data);
      setTimeout(() => setShowdownData(null), 5000); // clear after 5s
    };
    socket.on('showdown', handleShowdown);
    return () => { socket.off('showdown', handleShowdown); };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background with Nebula Dust & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03)_0%,#000000_100%)] z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen z-0 pointer-events-none" />
      
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A1020]/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/lobby" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            Node: {roomId}
          </div>
        </div>
        
        {/* Midnight Confidential Integrity Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d1326] border border-blue-500/30 rounded-sm">
            <Lock size={12} className="text-blue-400" />
            <span className="text-[10px] uppercase font-mono text-blue-400 tracking-widest">State Encrypted</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d1a16] border border-green-500/30 rounded-sm">
            <ShieldCheck size={12} className="text-green-400" />
            <span className="text-[10px] uppercase font-mono text-green-400 tracking-widest">ZKP Valid</span>
          </div>
        </div>
      </nav>

      {/* Showdown Celebration Overlay */}
      <AnimatePresence>
        {showdownData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] mb-4">
                System Override
              </h2>
              <div className="px-6 py-2 border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-md flex items-center gap-3">
                <ShieldCheck className="text-yellow-400" size={24} />
                <span className="text-yellow-400 font-mono tracking-widest uppercase font-bold">Proof Validated</span>
              </div>
              <p className="mt-6 text-xl font-bold tracking-widest uppercase">Winner: <span className="text-cyan-400">{showdownData.winnerId.substring(0,8)}</span></p>
              <p className="mt-2 text-white/60 font-mono">Awarded ${showdownData.pot}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Interface */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center pt-20">
        
        {/* Midnight Public State Dashboard (Top) */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          {gameState?.midnightState && (
             <div className="px-6 py-2 bg-[#0A1020]/90 border border-white/10 rounded-sm backdrop-blur-md shadow-2xl flex flex-col items-center">
               <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">Public Commitment Hash</span>
               <span className="text-xs font-mono text-cyan-400 mt-1">{gameState.midnightState.publicState.deckCommitment || 'AWAITING_SHUFFLE'}</span>
             </div>
          )}
        </div>

        {/* 3D Floating Monolith Table */}
        <div className={`relative w-full max-w-5xl aspect-[2.5/1] rounded-[500px] border-[8px] border-[#1e293b] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_100px_rgba(59,130,246,0.15)] flex items-center justify-center mb-16 bg-black overflow-hidden transition-all duration-500 ${showdownData ? 'shadow-[0_0_150px_rgba(250,204,21,0.3)] border-yellow-900/50' : ''}`}>
          
          {/* Recessed LED Strip */}
          <div className={`absolute inset-1 rounded-[500px] border-[3px] shadow-[0_0_40px_inset] pointer-events-none transition-colors duration-500 ${showdownData ? 'border-yellow-500/50 shadow-yellow-500/50' : 'border-blue-500/40 shadow-blue-500/40'}`} />
          
          {/* Surface: Black glass with grid */}
          <div className="absolute inset-[12px] rounded-[500px] bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/5 overflow-hidden">
             {/* Holographic scanning lines & faint grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Holographic Emitter in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-[50px] pointer-events-none" />
          
          {/* Center Community Cards & Pot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {gameState?.communityCards.map((card, i) => (
                  <motion.div 
                    key={`${card.rank}-${card.suit}-${i}`}
                    initial={{ opacity: 0, y: 20, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-16 h-24 bg-white border border-slate-300 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center rounded-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
                    <span className={`text-2xl font-serif font-black ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-900'} drop-shadow-sm`}>{card.rank}</span>
                    <span className={`text-2xl font-serif ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-900'} drop-shadow-sm`}>
                      {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Holographic Pot Display */}
            {gameState && (
              <div className="flex flex-col items-center mt-2 relative">
                <div className="absolute -bottom-4 w-32 h-1 bg-cyan-400/80 blur-[4px]" />
                <div className="absolute -bottom-4 w-16 h-1 bg-white blur-[2px]" />
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-2xl drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                  ${gameState.pot}
                </span>
                <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase mt-1 font-mono">Total Locked</span>
              </div>
            )}
          </div>

          {/* Players */}
          {gameState?.players.map((player, index) => {
            const isBottom = player.id === wallet.address;
            const posClass = isBottom 
              ? "bottom-[-60px] left-1/2 -translate-x-1/2 flex-col justify-end pb-4" 
              : "top-[-60px] left-1/2 -translate-x-1/2 flex-col justify-start pt-4";
            
            const isActive = gameState.activePlayerIndex === index;
            const isFolded = player.state === 'folded';

            return (
              <div key={player.id} className={`absolute w-56 ${posClass} z-30 transition-all duration-500`}>
                
                {/* 3D Metallic Avatar Frame */}
                <div 
                  className={`relative bg-[#0d1326] border border-white/10 p-4 flex flex-col items-center gap-1 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ${isActive ? 'ring-1 ring-cyan-400 scale-105' : ''} ${isFolded ? 'opacity-40 grayscale' : 'opacity-100'}`} 
                  style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                >
                   {/* Level Indicator Glow */}
                   {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />}
                   
                   {/* Red Alert Glitch for Folded */}
                   {isFolded && <div className="absolute inset-0 bg-red-900/20 mix-blend-color-burn" />}

                   <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                     {isFolded && <AlertCircle size={10} className="text-red-500" />}
                     {player.id.substring(0, 8)}
                   </span>
                   <span className={`font-black text-2xl tracking-tighter ${isBottom ? 'text-white' : 'text-white/80'} drop-shadow-md`}>${player.chips}</span>
                   {player.bet > 0 && <div className="mt-2 px-3 py-1 bg-white/5 border border-white/10 text-cyan-400 text-xs font-mono uppercase tracking-widest shadow-inner">Bet: ${player.bet}</div>}
                </div>
                
                {/* Midnight Private Cards Indicator */}
                {!isBottom && !isFolded && player.state !== 'waiting' && (
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 flex gap-1 z-[-1]">
                    <div className="w-10 h-14 bg-[#0a0a0a] border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden rounded-sm -rotate-6 translate-x-2">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:200%_200%] animate-[shimmer_2s_infinite]" />
                      <Lock size={12} className="text-white/10" />
                    </div>
                    <div className="w-10 h-14 bg-[#0a0a0a] border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden rounded-sm rotate-6 -translate-x-2">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:200%_200%] animate-[shimmer_2s_infinite]" />
                      <Lock size={12} className="text-white/10" />
                    </div>
                  </div>
                )}

                {/* My Cards */}
                {isBottom && player.cards && player.cards.length > 0 && (
                  <div className="absolute top-[-70px] left-1/2 -translate-x-1/2 flex gap-1.5 z-40">
                    {player.cards.map((c, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-14 h-20 bg-white border border-slate-300 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-base font-serif font-black ${c.suit === 'hearts' || c.suit === 'diamonds' ? 'text-red-600' : 'text-black'} transform transition-transform hover:-translate-y-2 hover:scale-110 rounded-sm origin-bottom ${i === 0 ? '-rotate-3 translate-x-1' : 'rotate-3 -translate-x-1'}`}
                      >
                        {c.rank}
                        <span className="text-xl">{c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactical Control Deck */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#020617] border-t border-white/5 flex items-center justify-between shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-50">
          <div className="flex items-center gap-4">
            {!gameState?.inProgress && (
              <button 
                onClick={handleStart} 
                className="px-8 py-4 bg-[#0a1824] border border-cyan-900/50 text-cyan-400 hover:bg-[#0f2438] hover:border-cyan-400 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(34,211,238,0.2)] rounded-sm"
              >
                Initialize Sequence
              </button>
            )}
          </div>

          {isMyTurn && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleAction('fold')} 
                className="px-8 py-4 bg-[#1a0f14] border border-red-900/50 text-red-500 hover:bg-[#2a1218] hover:border-red-500 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(239,68,68,0.2)] rounded-sm"
              >
                Fold
              </button>
              <button 
                onClick={() => handleAction('check')} 
                className="px-8 py-4 bg-[#0a1824] border border-blue-900/50 text-blue-400 hover:bg-[#0f2438] hover:border-blue-400 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] rounded-sm"
              >
                Check
              </button>
              <button 
                onClick={() => handleAction('call')} 
                className="px-8 py-4 bg-[#0a1824] border border-cyan-900/50 text-cyan-400 hover:bg-[#0f2438] hover:border-cyan-400 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(34,211,238,0.2)] rounded-sm"
              >
                Call
              </button>
              <div className="flex items-center bg-[#0d1326] border border-purple-900/50 rounded-sm">
                <input 
                  type="number" 
                  value={actionAmount || ""} 
                  onChange={e => setActionAmount(parseInt(e.target.value) || 0)} 
                  placeholder="0"
                  className="w-24 px-4 py-4 bg-transparent text-white font-mono text-xs focus:outline-none focus:bg-white/5 transition-colors placeholder:text-white/20"
                />
                <button 
                  onClick={() => handleAction('raise')} 
                  className="px-8 py-4 bg-[#160f24] border-l border-purple-900/50 text-purple-400 hover:bg-[#241638] hover:border-purple-400 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] rounded-r-sm"
                >
                  Raise
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
