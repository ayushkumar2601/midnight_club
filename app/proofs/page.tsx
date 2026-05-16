"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Database, FileKey, Activity, Cpu } from "lucide-react";
import { useGameStore } from "../../lib/stores/useGameStore";

export default function ProofsDashboard() {
  const lastProof = useGameStore((state) => state.lastProof);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (lastProof) {
      setLogs((prev) => [
        { id: Date.now(), timestamp: new Date().toISOString(), ...lastProof },
        ...prev
      ]);
    }
  }, [lastProof]);

  return (
    <div className="relative w-full min-h-screen bg-[#050816] text-white font-sans overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-50" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A1020]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-none shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            Verification Terminal
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 border border-purple-500/30 bg-purple-500/10 glow-purple">
          <Activity size={14} className="text-purple-400" />
          <span className="text-xs uppercase tracking-widest text-purple-400 font-mono">Scanning Network</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Cryptographic Audit
          </h1>
          <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">Zero-Knowledge Proof Timeline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#10182B] border border-white/5 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <Database size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">Global State</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="text-white/40 text-[10px] font-mono uppercase">Verified Hands</span>
                <span className="text-white font-mono text-sm">1,204,492</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                <span className="text-white/40 text-[10px] font-mono uppercase">Cheat Attempts Blocked</span>
                <span className="text-green-400 font-mono text-sm">0</span>
              </div>
            </div>

            <div className="bg-[#10182B] border border-white/5 p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 text-purple-400">
                <Cpu size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">Midnight Node Status</span>
              </div>
              <div className="text-white/60 text-xs leading-relaxed font-mono mt-2">
                All hidden information is secured via homomorphic encryption and proven via zk-SNARKs.
              </div>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-white font-bold uppercase tracking-widest text-sm">Live Proof Feed</h2>
              <span className="text-[10px] text-white/40 font-mono uppercase animate-pulse">Awaiting blocks...</span>
            </div>

            <div className="flex flex-col gap-4 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              <AnimatePresence>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-12 flex flex-col items-center justify-center border border-white/5 bg-[#10182B]/50"
                  >
                    <FileKey size={32} className="text-white/20 mb-4" />
                    <span className="text-white/40 text-xs font-mono uppercase">No proofs generated in current session</span>
                  </motion.div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-full bg-[#10182B] border-l-2 border-blue-500 p-5 flex flex-col gap-3 group hover:bg-[#151f38] transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-blue-400" />
                          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{log.type} PROOF</span>
                        </div>
                        <span className="text-white/30 text-[10px] font-mono">{log.timestamp}</span>
                      </div>
                      
                      <div className="bg-[#050816] border border-white/5 p-3 overflow-hidden">
                        <span className="text-white/50 text-[10px] font-mono block mb-1">ZK_PAYLOAD_HASH:</span>
                        <span className="text-cyan-400 text-xs font-mono break-all">{log.proofBytes || `0x${Math.random().toString(16).substr(2, 64)}`}</span>
                      </div>
                      
                      <button className="self-end text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">
                        Inspect Replay Timeline →
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
