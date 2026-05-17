"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Cpu, EyeOff, Lock, AlertCircle, Sparkles, Send } from "lucide-react";
import { socket } from "../../../lib/socket/socket";
import { useGameStore } from "../../../lib/stores/useGameStore";
import { useWalletStore } from "../../../lib/stores/useWalletStore";

export default function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const gameState = useGameStore((state) => state.gameState);
  const wallet = useWalletStore();
  const [actionAmount, setActionAmount] = useState(0);

  // ZK proof simulation state
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [proofStep, setProofStep] = useState("");

  // Refs for tracking round changes for real-time cryptographic logs
  const lastLoggedRound = useRef<string>("");
  const lastLoggedCardsCount = useRef<number>(0);
  const lastActivePlayerId = useRef<string>("");

  // Connect and join room on mount
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      socket.emit('joinRoom', { 
        roomId, 
        player: { id: wallet.address, name: "Player", chips: 250000, state: 'waiting', cards: [] } 
      });
    } else {
      socket.emit('joinRoom', { roomId }); // spectate
    }
  }, [roomId, wallet.isConnected, wallet.address]);

  const handleStart = () => socket.emit('startGame', { roomId });
  
  const handlePlayAction = (action: 'fold' | 'check' | 'call' | 'raise') => {
    setIsGeneratingProof(true);
    
    // Simulate high-fidelity ZK-proof generation pipeline steps
    const steps = [
      "INITIALIZING LOCAL PROTOCOL TRANSITION...",
      "FETCHING PRIVATE CARD DATA FOR WALLET SIGNATURE...",
      "COMPUTING zk-SNARK CONSTRAINT MATRIX...",
      "GENERATING RECURSIVE PROOF OF VALID MOVE STATE...",
      "BROADCASTING ZKP TO AUTHORITATIVE MIDNIGHT NODE..."
    ];
    
    let currentStep = 0;
    setProofStep(steps[0]);
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProofStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsGeneratingProof(false);
        socket.emit('playerAction', { 
          roomId, 
          playerId: wallet.address, 
          payload: { action, amount: action === 'raise' ? actionAmount : undefined } 
        });
      }
    }, 280);
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

  const [chatLogs, setChatLogs] = useState<{ sender: string; message: string; color?: string }[]>([]);
  
  // Bot chat listeners
  useEffect(() => {
    const handleBotChat = (data: { sender: string; message: string; color?: string }) => {
      setChatLogs(prev => [...prev, data].slice(-15));
    };
    socket.on('botChat', handleBotChat);
    return () => { socket.off('botChat', handleBotChat); };
  }, []);

  // Cryptographic log streaming based on gameState updates
  useEffect(() => {
    if (!gameState) return;
    
    const logs: { sender: string; message: string; color: string }[] = [];
    
    // 1. Log round transitions
    if (gameState.round && gameState.round !== lastLoggedRound.current) {
      lastLoggedRound.current = gameState.round;
      
      const roundUpper = gameState.round.toUpperCase();
      logs.push({
        sender: "ZK-NODE",
        message: `DECOMPILING '${roundUpper}' STREET PROTOCOL STATE TRANSITION...`,
        color: "#10B981" // emerald
      });
      
      if (gameState.midnightState?.publicState?.deckCommitment) {
        logs.push({
          sender: "SHUFFLE-ENG",
          message: `WITNESS VALIDATED. DECK COMMITMENT: ${gameState.midnightState.publicState.deckCommitment.substring(0, 16)}...`,
          color: "#34D399"
        });
      }
    }
    
    // 2. Log changes in community cards count
    if (gameState.communityCards.length !== lastLoggedCardsCount.current) {
      lastLoggedCardsCount.current = gameState.communityCards.length;
      if (gameState.communityCards.length > 0) {
        logs.push({
          sender: "VERIFIER",
          message: `CONFIRMED ${gameState.communityCards.length} PUBLIC BOARD CARDS IN ZK-RECONCILIATION FEED`,
          color: "#60A5FA" // blue
        });
      }
    }
    
    // 3. Log active player turn changes
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (activePlayer && activePlayer.id !== lastActivePlayerId.current) {
      lastActivePlayerId.current = activePlayer.id;
      const isMe = activePlayer.id === wallet.address;
      
      logs.push({
        sender: "SCHEDULER",
        message: isMe 
          ? ">>> YOUR TURN: COMPILING TRANSITION PROOF AND ALLOCATING NODE CHIPS <<<"
          : `NODE '${activePlayer.name || activePlayer.id.substring(0, 6)}' SELECTED FOR TRANSITION DECISION`,
        color: isMe ? "#F59E0B" : "#A78BFA" // amber or purple
      });
    }

    if (logs.length > 0) {
      setChatLogs(prev => [...prev, ...logs].slice(-15));
    }
  }, [gameState, wallet.address]);

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
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
            Node: {roomId}
          </div>
        </div>
        
        {/* Midnight Confidential Integrity Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d1326] border border-blue-500/30 rounded-sm">
            <Lock size={12} className="text-blue-400" />
            <span className="text-[10px] uppercase font-mono text-blue-400 tracking-widest">State Encrypted</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d1a16] border border-green-500/30 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <ShieldCheck size={12} className="text-green-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono text-green-400 tracking-widest">ZKP Active</span>
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
          >
            <div className="flex flex-col items-center p-8 border border-yellow-500/20 bg-slate-950/90 shadow-[0_0_100px_rgba(250,204,21,0.15)] rounded-sm">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-4">
                System Override
              </h2>
              <div className="px-6 py-2 border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md flex items-center gap-3 rounded-sm mb-6">
                <ShieldCheck className="text-yellow-400" size={24} />
                <span className="text-yellow-400 font-mono tracking-widest uppercase font-bold text-xs">ZK Proof Validated</span>
              </div>
              <p className="text-xl font-bold tracking-widest uppercase font-mono">Winner Node: <span className="text-cyan-400">{showdownData.winnerId.substring(0,8)}</span></p>
              <p className="mt-2 text-white/60 font-mono text-sm">Awarded ${showdownData.pot.toLocaleString()} Pot Credits</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZK Proof Generator Overlay */}
      <AnimatePresence>
        {isGeneratingProof && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 pointer-events-auto"
          >
            <div className="w-96 flex flex-col gap-4 border border-cyan-500/20 bg-slate-950/80 p-8 rounded-sm shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <div className="flex items-center gap-3">
                <Cpu className="text-cyan-400 animate-spin" size={24} />
                <span className="text-sm font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">ZK Proof Compiler</span>
              </div>
              
              <div className="w-full bg-slate-900 h-1.5 overflow-hidden rounded-xs border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-cyan-400 shadow-[0_0_10px_var(--accent-cyan)]"
                />
              </div>
              
              <div className="text-[10px] font-mono text-cyan-400/80 leading-relaxed border-t border-cyan-500/10 pt-4 mt-2 h-20 overflow-hidden">
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-white/80 select-none font-bold"
                >
                  {proofStep}
                </motion.div>
                <div className="text-white/30 text-[8px] mt-2 uppercase tracking-widest">Verifying transaction constraints locally...</div>
              </div>
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
        <div className={`relative w-full max-w-5xl aspect-[2.5/1] rounded-[500px] border-[8px] border-[#111111] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_100px_rgba(26,61,232,0.15)] flex items-center justify-center mb-16 bg-black overflow-hidden transition-all duration-500 ${showdownData ? 'shadow-[0_0_150px_rgba(253,82,0,0.3)] border-yellow-500/30' : ''}`}>
          
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
                {/* Render active community cards */}
                {gameState?.communityCards.map((card, i) => (
                  <motion.div 
                    key={`${card.rank}-${card.suit}-${i}`}
                    initial={{ opacity: 0, y: 20, rotateY: 90 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-16 h-24 bg-white border border-slate-300 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center rounded-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
                    <span className={`text-2xl font-sans font-black ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-900'} drop-shadow-sm`}>{card.rank}</span>
                    <span className={`text-2xl font-sans ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-900'} drop-shadow-sm`}>
                      {card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                    </span>
                  </motion.div>
                ))}
                
                {/* Render locked placeholder cards up to 5 */}
                {gameState && Array.from({ length: 5 - gameState.communityCards.length }).map((_, idx) => (
                  <div 
                    key={`locked-${idx}`}
                    className="w-16 h-24 bg-[#0a0f1d] border border-cyan-500/10 shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center rounded-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-cyan-500/[0.01] pointer-events-none" />
                    <Lock size={16} className="text-cyan-500/30 group-hover:text-cyan-500/50 transition-colors" />
                    <span className="text-[8px] font-mono text-cyan-500/30 mt-1 uppercase tracking-widest group-hover:text-cyan-500/50 transition-colors">Locked</span>
                  </div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Holographic Pot Display */}
            {gameState && (
              <div className="flex flex-col items-center mt-2 relative">
                <div className="absolute -bottom-4 w-32 h-1 bg-cyan-400/80 blur-[4px]" />
                <div className="absolute -bottom-4 w-16 h-1 bg-white blur-[2px]" />
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-2xl drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                  ${gameState.pot.toLocaleString()}
                </span>
                <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase mt-1 font-mono">Total Locked</span>
              </div>
            )}
          </div>

          {/* Players */}
          {gameState?.players.map((player, index) => {
            const isBottom = player.id === wallet.address;
            
            const seatPositions = [
              { left: '50%', top: '105%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-end pb-4' }, // Bottom (Me)
              { left: '12%', top: '80%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-end' },  // Bottom-Left
              { left: '-8%', top: '50%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-center' },  // Left
              { left: '12%', top: '20%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-start' },  // Top-Left
              { left: '50%', top: '-8%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-start pt-4' }, // Top
              { left: '88%', top: '20%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-start' },  // Top-Right
              { left: '108%', top: '50%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-center' }, // Right
              { left: '88%', top: '80%', translate: '-translate-x-1/2 -translate-y-1/2 flex-col justify-end' }   // Bottom-Right
            ];

            const myIndex = gameState?.players.findIndex(p => p.id === wallet.address) ?? 0;
            const safeMyIndex = myIndex === -1 ? 0 : myIndex;
            const seatIndex = (index - safeMyIndex + gameState.players.length) % gameState.players.length;
            const seat = seatPositions[seatIndex % seatPositions.length];
            
            const isActive = gameState.activePlayerIndex === index;
            const isFolded = player.state === 'folded';
            const displayName = player.id.startsWith('BOT_') ? player.name : player.id.substring(0, 8);

            return (
              <div 
                key={player.id} 
                className={`absolute w-56 flex ${seat.translate} z-30 transition-all duration-500`}
                style={{ left: seat.left, top: seat.top }}
              >
                
                {/* 3D Metallic Avatar Frame */}
                <div 
                  className={`relative bg-slate-950/80 border p-4 flex flex-col items-center gap-1 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ${isActive ? (isBottom ? 'ring-2 ring-emerald-500 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_30px_rgba(34,211,238,0.4)]') : ''} ${isFolded ? 'opacity-40 grayscale' : 'opacity-100'}`} 
                  style={{ 
                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                    borderColor: player.avatarColor || 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                   {/* Turn indicator bar */}
                   {isActive && (
                     <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 shadow-[0_0_15px] ${isBottom ? 'bg-emerald-500 shadow-emerald-500' : 'bg-cyan-400 shadow-cyan-400'}`} />
                   )}
                   
                   {/* Red Alert Glitch for Folded */}
                   {isFolded && <div className="absolute inset-0 bg-red-900/20 mix-blend-color-burn" />}

                   <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                     {isFolded && <AlertCircle size={10} className="text-red-500" />}
                     {displayName}
                     {player.title && (
                       <span className="px-1.5 py-0.2 bg-white/5 border border-white/10 text-[8px] font-mono font-bold tracking-widest text-cyan-400">
                         {player.title}
                       </span>
                     )}
                   </span>
                   <span className={`font-black text-2xl tracking-tighter ${isBottom ? 'text-white' : 'text-white/80'} drop-shadow-md`}>${player.chips.toLocaleString()}</span>
                   {player.bet > 0 && <div className="mt-2 px-3 py-1 bg-white/5 border border-white/10 text-cyan-400 text-xs font-mono uppercase tracking-widest shadow-inner">Bet: ${player.bet.toLocaleString()}</div>}
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
                        className={`w-14 h-20 bg-white border border-slate-300 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-base font-sans font-black ${c.suit === 'hearts' || c.suit === 'diamonds' ? 'text-red-600' : 'text-black'} transform transition-transform hover:-translate-y-2 hover:scale-110 rounded-sm origin-bottom ${i === 0 ? '-rotate-3 translate-x-1' : 'rotate-3 -translate-x-1'}`}
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
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#020617]/95 border-t border-white/10 backdrop-blur-xl flex items-center justify-between shadow-[0_-30px_50px_rgba(0,0,0,0.9)] z-50">
          <div className="flex items-center gap-4 w-full justify-between">
            {/* If wallet not connected */}
            {!wallet.isConnected ? (
              <div className="w-full flex items-center justify-between px-4">
                <span className="text-white/40 text-xs font-mono uppercase tracking-[0.25em] flex items-center gap-2">
                  <EyeOff size={14} className="text-red-400" /> Spectator Mode • Seating connection inactive
                </span>
                <button 
                  onClick={wallet.connect} 
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] rounded-sm"
                >
                  Connect mock wallet & join seat
                </button>
              </div>
            ) : (
              // Seated player or waiting
              <>
                <div className="flex items-center gap-4">
                  {/* If user is waiting or spectator but connected */}
                  {!me && (
                    <button 
                      onClick={() => socket.emit('joinRoom', { 
                        roomId, 
                        player: { id: wallet.address, name: "Player", chips: 250000, state: 'waiting', cards: [] } 
                      })} 
                      className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-[0.2em] transition-all duration-150 active:translate-y-1 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] rounded-sm animate-pulse"
                    >
                      Seat Node at Table
                    </button>
                  )}
                  
                  {/* Start or Force restart next hand */}
                  {gameState && (
                    <button 
                      onClick={handleStart} 
                      className="px-8 py-4 bg-orange-500/10 border border-orange-500/50 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(249,115,22,0.2)] rounded-sm"
                    >
                      {gameState.inProgress ? "Force Deal Next Hand" : "Initialize Sequence"}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => socket.emit('addBot', { roomId })} 
                    className="px-6 py-4 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 rounded-sm"
                  >
                    Add Bot Node
                  </button>
                </div>
                
                {/* Active Player Controls */}
                {isMyTurn && (
                  <div className="flex items-center gap-4 animate-[slideUp_0.3s_ease] border border-cyan-400/30 p-2 bg-[#040b1e]/90 rounded-sm shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                    <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mr-2 flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={12} className="text-cyan-400" /> Player Action Required
                    </div>
                    
                    <button 
                      onClick={() => handlePlayAction('fold')} 
                      className="px-8 py-4 bg-[#1a0f14] border border-red-900/50 text-red-500 hover:bg-[#2a1218] hover:border-red-500 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(239,68,68,0.2)] rounded-sm"
                    >
                      Fold
                    </button>
                    <button 
                      onClick={() => handlePlayAction('check')} 
                      className="px-8 py-4 bg-blue-500/10 border border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] rounded-sm"
                    >
                      Check
                    </button>
                    <button 
                      onClick={() => handlePlayAction('call')} 
                      className="px-8 py-4 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)] rounded-sm"
                    >
                      Call
                    </button>
                    
                    {/* Premium Raise deck */}
                    <div className="flex flex-col gap-1 bg-[#0d1326] border border-purple-900/50 p-2 rounded-sm">
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={actionAmount || ""} 
                          onChange={e => setActionAmount(Math.max(0, parseInt(e.target.value) || 0))} 
                          placeholder="Raise amount"
                          className="w-24 px-4 py-2 bg-transparent text-white font-mono text-xs focus:outline-none focus:bg-white/5 transition-colors placeholder:text-white/20"
                        />
                        <button 
                          onClick={() => handlePlayAction('raise')} 
                          className="px-6 py-2 bg-[#160f24] border-l border-purple-900/50 text-purple-400 hover:bg-[#241638] hover:border-purple-400 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-150 active:translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] rounded-r-sm"
                        >
                          Raise
                        </button>
                      </div>
                      
                      {/* Quick bets */}
                      {gameState && (
                        <div className="flex gap-1 mt-1 justify-between">
                          <button onClick={() => setActionAmount(gameState.currentBet * 2)} className="text-[8px] font-mono text-purple-400 hover:text-white px-1 py-0.5 bg-white/5 rounded-xs">2x</button>
                          <button onClick={() => setActionAmount(gameState.currentBet * 3)} className="text-[8px] font-mono text-purple-400 hover:text-white px-1 py-0.5 bg-white/5 rounded-xs">3x</button>
                          <button onClick={() => setActionAmount(gameState.pot)} className="text-[8px] font-mono text-purple-400 hover:text-white px-1 py-0.5 bg-white/5 rounded-xs">POT</button>
                          {me && <button onClick={() => setActionAmount(me.chips)} className="text-[8px] font-mono text-red-400 hover:text-white px-1 py-0.5 bg-white/5 rounded-xs">ALL-IN</button>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Cyberpunk Chat Feed Log */}
        <div className="fixed bottom-28 left-6 w-80 h-36 bg-black/70 border border-white/10 backdrop-blur-md rounded-sm p-4 z-40 overflow-y-auto flex flex-col gap-1.5 scrollbar-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5 pb-1 mb-1 flex justify-between items-center">
            <span>Confidential Network Broadcasts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto h-full pr-1">
            {chatLogs.map((log, i) => (
              <div key={i} className="text-[10px] font-mono leading-relaxed animate-[fadeIn_0.3s_ease] border-l-2 border-white/5 pl-1.5">
                <span className="font-black uppercase tracking-tight mr-1.5" style={{ color: log.color || '#58A6FF' }}>{log.sender}:</span>
                <span className="text-white/80">{log.message}</span>
              </div>
            ))}
            {chatLogs.length === 0 && <div className="text-[9px] font-mono text-white/20 italic">No network broadcasts logged...</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
