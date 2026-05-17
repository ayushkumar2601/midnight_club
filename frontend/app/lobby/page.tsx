"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, ShieldCheck, Activity, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket/socket";
import { useWalletStore } from "@/lib/stores/useWalletStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function LobbyPage() {
  const router = useRouter();
  const wallet = useWalletStore();
  
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_URL}/rooms`);
        const data = await res.json();
        
        const mappedTables = data.map((room: any) => ({
          id: room.id,
          name: room.name,
          type: room.type,
          stakes: room.stakes,
          players: room.players,
          max: room.maxPlayers,
          pot: `$ ${room.pot.toLocaleString()}`,
          status: room.players >= room.maxPlayers ? "Full" : "Open"
        }));
        
        setTables(mappedTables);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    };
    
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (tableId: string) => {
    if (!wallet.isConnected) {
      alert("Please connect wallet first");
      return;
    }
    router.push(`/table/${tableId}`);
  };

  const handleCreate = () => {
    if (!wallet.isConnected) {
      wallet.connect();
    }
    const newId = `M-NLH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    router.push(`/table/${newId}`);
  };

  const handleQuickJoin = () => {
    if (!wallet.isConnected) {
      wallet.connect();
    }
    // Find first table with players < max
    const openTable = tables.find(t => t.players < t.max);
    if (openTable) {
      router.push(`/table/${openTable.id}`);
    } else {
      const newId = `M-NLH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      router.push(`/table/${newId}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,61,232,0.05)_0%,var(--background)_100%)] z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 z-0" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A1020]/40 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-none shadow-[0_0_10px_var(--primary)]" />
            Midnight Protocol
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 border border-white/5 bg-white/5 rounded-sm">
            <Activity size={14} className="text-green-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-mono">Network Stable</span>
          </div>
          
          <div className="flex items-center gap-3">
            {wallet.isConnected && (
              <div className="flex flex-col items-end pr-4 border-r border-white/10">
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Balance</span>
                <div className="flex items-center gap-1.5 text-[var(--accent-cyan)]">
                  <Wallet size={12} />
                  <span className="text-sm font-bold tracking-tight">${wallet.balance.toLocaleString()}</span>
                </div>
              </div>
            )}
            <button 
              onClick={wallet.isConnected ? wallet.disconnect : wallet.connect}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 rounded-sm ${
                wallet.isConnected 
                  ? "border-green-500/30 text-green-400 hover:bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                  : "border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(253,82,0,0.2)]"
              }`}
            >
              {wallet.isConnecting ? "Connecting..." : wallet.isConnected ? wallet.address : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 drop-shadow-md">
              Active <span className="text-[var(--accent-cyan)]">Nodes</span>
            </h1>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">Select a table to initialize session</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleQuickJoin}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[#050505] text-xs font-black uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(253,82,0,0.3)] rounded-sm"
            >
              Quick Match
            </button>
            <button 
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--background-secondary)] border border-[var(--accent-cyan)]/50 text-[var(--accent-cyan)] text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-[var(--background-tertiary)] hover:border-[var(--accent-cyan)] rounded-sm hover:shadow-[0_0_30px_rgba(88,166,255,0.2)]"
            >
              <Plus size={16} /> Deploy New Table
            </button>
          </div>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="bg-[#0a0a0a] border border-white/5 p-6 flex flex-col gap-2 rounded-sm shadow-xl">
            <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Global Liquidity</span>
            <span className="text-2xl font-black text-white drop-shadow-md">$ 12.4M</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-[#0a0a0a] border border-white/5 p-6 flex flex-col gap-2 rounded-sm shadow-xl">
            <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Active Players</span>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              <span className="text-2xl font-black text-white drop-shadow-md">1,402</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="bg-[#0a0a0a] border border-white/5 p-6 flex flex-col gap-2 relative overflow-hidden rounded-sm shadow-xl">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent-blue)]/10 blur-3xl rounded-full" />
            <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Midnight Verification</span>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent-blue)]" />
              <span className="text-2xl font-black text-white drop-shadow-md">Active</span>
            </div>
          </motion.div>
        </div>

        {/* Terminal-style Data Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full bg-[#050505] border border-white/5 font-mono text-xs overflow-x-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm"
        >
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 p-5 border-b border-white/5 bg-[#0a0a0a] text-white/30 uppercase tracking-widest text-[10px]">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="grid grid-cols-6 gap-4 p-5 border-b border-white/5 hover:bg-white/[0.02] transition-all items-center group cursor-pointer"
                onClick={() => row.status !== "Full" && handleJoin(row.id)}
              >
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-[var(--accent-cyan)] font-bold group-hover:text-white transition-colors tracking-widest">{row.name}</span>
                  <span className="text-white/30 text-[9px] uppercase">{row.id} • {row.type}</span>
                </div>
                <div className="text-white/70">{row.stakes}</div>
                <div className="text-white/50 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${row.status === "Full" ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" : "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"}`} />
                  <span className={row.status === "Full" ? "text-red-400" : "text-green-400"}>{row.players}</span>
                  <span className="opacity-50">/{row.max}</span>
                </div>
                <div className="text-purple-400 font-bold drop-shadow-sm">{row.pot}</div>
                <div className="text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleJoin(row.id); }}
                    className={`px-6 py-2.5 bg-transparent border uppercase tracking-widest text-[9px] font-bold transition-all duration-300 rounded-sm ${
                      row.status === "Full" 
                        ? "border-white/5 text-white/20 cursor-not-allowed bg-white/[0.01]" 
                        : "border-white/10 text-white/60 hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 hover:shadow-[0_0_15px_rgba(88,166,255,0.1)]"
                    }`}
                  >
                    {row.status === "Full" ? "Spectate" : "Join Node"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
