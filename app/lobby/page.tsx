"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, ShieldCheck, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { socket } from "../../lib/socket/socket";
import { useWalletStore } from "../../lib/stores/useWalletStore";

export default function LobbyPage() {
  const router = useRouter();
  const wallet = useWalletStore();
  
  // Mock realtime data for the lobby
  const [tables, setTables] = useState([
    { id: "M-NLH-8X9A", type: "No Limit Hold'em", stakes: "1K / 2K USDC", players: 6, max: 8, pot: "$ 45.2K", status: "Open" },
    { id: "M-PLO-2B4F", type: "Pot Limit Omaha", stakes: "500 / 1K USDC", players: 4, max: 6, pot: "$ 12.8K", status: "Open" },
    { id: "M-NLH-7C1X", type: "No Limit Hold'em", stakes: "10K / 20K USDC", players: 8, max: 8, pot: "$ 240.5K", status: "Full" },
  ]);

  const handleJoin = (tableId: string) => {
    if (!wallet.isConnected) {
      alert("Please connect wallet first");
      return;
    }
    // In a real app, we'd emit a joinRoom event here and redirect on success
    router.push(`/table/${tableId}`);
  };

  const handleCreate = () => {
    if (!wallet.isConnected) {
      alert("Please connect wallet first");
      return;
    }
    const newId = `M-NLH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    router.push(`/table/${newId}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#050816] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A1020]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-none shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            Midnight Protocol
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 border border-white/10 bg-[#10182B]">
            <Activity size={14} className="text-green-400" />
            <span className="text-xs uppercase tracking-widest text-white/60 font-mono">Network Stable</span>
          </div>
          
          <button 
            onClick={wallet.isConnected ? wallet.disconnect : wallet.connect}
            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
              wallet.isConnected 
                ? "border-green-500/30 text-green-400 hover:bg-green-500/10 glow-green" 
                : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10 glow-blue"
            }`}
          >
            {wallet.isConnecting ? "Connecting..." : wallet.isConnected ? wallet.address : "Connect Wallet"}
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Active <span className="text-cyan-400">Nodes</span>
            </h1>
            <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">Select a table to initialize session</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400"
          >
            <Plus size={16} /> Deploy New Table
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#10182B] border border-white/5 p-6 flex flex-col gap-2">
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Global Liquidity</span>
            <span className="text-2xl font-black text-white">$ 12.4M</span>
          </div>
          <div className="bg-[#10182B] border border-white/5 p-6 flex flex-col gap-2">
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Active Players</span>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              <span className="text-2xl font-black text-white">1,402</span>
            </div>
          </div>
          <div className="bg-[#10182B] border border-white/5 p-6 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Midnight Verification</span>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              <span className="text-2xl font-black text-white">Active</span>
            </div>
          </div>
        </div>

        {/* Terminal-style Data Grid */}
        <div className="w-full bg-[#050816] border border-white/10 font-mono text-xs overflow-x-auto shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 bg-[#10182B] text-white/40 uppercase tracking-widest">
              <div className="col-span-2">Table ID</div>
              <div>Stakes</div>
              <div>Players</div>
              <div>Avg Pot</div>
              <div className="text-right">Action</div>
            </div>
            
            {/* Rows */}
            {tables.map((row, i) => (
              <motion.div 
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="grid grid-cols-6 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group cursor-pointer"
                onClick={() => row.status !== "Full" && handleJoin(row.id)}
              >
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-cyan-400 font-bold group-hover:text-cyan-300 transition-colors">{row.id}</span>
                  <span className="text-white/40 text-[10px]">{row.type}</span>
                </div>
                <div className="text-white/80">{row.stakes}</div>
                <div className="text-white/60">
                  <span className={row.status === "Full" ? "text-red-400" : "text-green-400"}>{row.players}</span>
                  /{row.max}
                </div>
                <div className="text-purple-400">{row.pot}</div>
                <div className="text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleJoin(row.id); }}
                    className={`px-4 py-2 bg-transparent border uppercase tracking-widest text-[10px] transition-colors ${
                      row.status === "Full" 
                        ? "border-white/10 text-white/40 cursor-not-allowed" 
                        : "border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400"
                    }`}
                  >
                    {row.status === "Full" ? "Spectate" : "Join Node"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
