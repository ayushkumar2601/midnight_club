"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, ShieldCheck } from "lucide-react";

export default function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);

  // Mock timeline data
  const timeline = [
    { time: "00:00", action: "DECK_SHUFFLE", proof: "VALID", detail: "Seed: 0x9A...2F" },
    { time: "00:02", action: "CARDS_DEALT", proof: "VALID", detail: "Commitments Logged" },
    { time: "00:15", action: "PLAYER_RAISE", proof: "VALID", detail: "0x3A...B2 raises $400" },
    { time: "00:22", action: "PLAYER_CALL", proof: "VALID", detail: "0x7F...9A calls $400" },
    { time: "00:25", action: "FLOP_REVEAL", proof: "VALID", detail: "A♠ K♠ 2♥" },
    { time: "00:45", action: "SHOWDOWN", proof: "VALID", detail: "0x3A...B2 wins $2400" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#050816] text-white font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,#050816_100%)] z-0" />
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A1020]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/proofs" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-none shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            Replay Engine
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest text-white/50 font-mono">
          Game ID: {gameId}
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Replay Theater */}
        <div className="w-full aspect-video bg-[#0A1020] border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.05)] mb-8 flex flex-col items-center justify-center relative overflow-hidden">
          <ShieldCheck size={64} className="text-white/5 mb-4" />
          <h2 className="text-2xl font-bold uppercase tracking-widest text-white/20">Cryptographic Replay Viewer</h2>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm border-t border-white/10 flex items-center justify-center gap-6">
            <button className="text-white/60 hover:text-white transition-colors"><SkipBack size={20} /></button>
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20 glow-cyan"><Play size={20} className="ml-1" /></button>
            <button className="text-white/60 hover:text-white transition-colors"><SkipForward size={20} /></button>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="bg-[#10182B] border border-white/5 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">Action History & Proof Validation</h3>
          <div className="flex flex-col gap-1">
            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-4 gap-4 py-3 border-b border-white/5 text-xs font-mono items-center hover:bg-white/5 px-2 transition-colors"
              >
                <div className="text-white/40">{item.time}</div>
                <div className="text-white font-bold">{item.action}</div>
                <div className="text-white/60">{item.detail}</div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-400 border border-green-500/30 px-2 py-0.5 bg-green-500/10">
                    <ShieldCheck size={10} /> {item.proof}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
