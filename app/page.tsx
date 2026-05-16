"use client";

import { ArrowRight, Menu, X, Shield, Zap, UserX, Cpu, Activity, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const BG_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

const NAV_ITEMS = [
  { label: "Platform", href: "/lobby" },
  { label: "Leaderboards", href: "/leaderboard" },
  { label: "Tables", href: "/tables" },
  { label: "Fairness", href: "/fairness" },
];

const TRANSITION = { duration: 0.8, ease: [0.23, 1, 0.32, 1] };

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
            className="fixed inset-0 z-30 lg:hidden bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={TRANSITION}
            className="fixed top-0 left-0 right-0 z-40 lg:hidden overflow-hidden bg-[#050816]/95 border-b border-white/10"
          >
            <div className="pt-24 pb-8 px-6">
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...TRANSITION, delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="text-white/60 hover:text-white text-lg py-3 flex items-center justify-between group uppercase tracking-widest font-mono text-xs"
                    >
                      {item.label}
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...TRANSITION, delay: 0.4 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <Link
                  href="/lobby"
                  className="w-full py-4 text-white text-xs font-bold uppercase tracking-widest transition-premium hover:bg-white/5 border border-blue-500/30 flex items-center justify-center glow-blue"
                  onClick={onClose}
                >
                  Connect Wallet
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 transition-all duration-500 ${
          scrolled ? "bg-[#050816]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <Link href="/" className="text-white text-xl font-black tracking-tighter uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-none shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          Midnight
        </Link>
        <div className="hidden lg:flex items-center gap-8 glass px-8 py-3 rounded-none border border-white/10">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-premium"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center z-50"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
          <Link
            href="/lobby"
            className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 text-blue-400 border border-blue-500/30 transition-premium hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            Connect Wallet
          </Link>
        </div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#050816] selection:bg-blue-500/30 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          src={BG_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />
        
        {/* Radial gradient mask for depth */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050816_80%)]" />

        <div className="relative z-20 flex flex-col items-center text-center px-6 mt-12 w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSITION, delay: 0.1 }}
            className="flex items-center gap-3 px-4 py-1.5 border border-white/10 glass mb-8"
          >
            <Activity size={14} className="text-blue-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/80 font-mono">Protocol v2.4 Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...TRANSITION, delay: 0.2 }}
            className="text-white font-black leading-[1] tracking-tighter uppercase text-center drop-shadow-2xl"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            Where precision <br /> finds its <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">edge</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSITION, delay: 0.4 }}
            className="mt-8 text-white/50 text-sm md:text-base leading-relaxed max-w-xl font-thin tracking-widest uppercase"
          >
            A high-security confidential protocol. <br className="hidden sm:block" />
            Zero trust. Provably fair. Infinite liquidity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSITION, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-6"
          >
            <Link
              href="/lobby"
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all duration-500 hover:bg-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-500" />
              Initialize Session
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/docs"
              className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Lock size={14} /> View Protocol Specs
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        >
          <span className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* SLIDE 1: THE PROTOCOL */}
      <section className="relative w-full py-32 px-6 lg:px-12 border-t border-white/5 bg-[#0A1020] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            {/* Holographic Card Scanner Mock */}
            <div className="relative w-full aspect-[4/3] bg-[#10182B] border border-white/10 p-1 flex items-center justify-center group overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-48 h-72 border border-blue-500/50 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <span className="text-4xl text-blue-400 font-serif drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">A♠</span>
                
                {/* Laser Line */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#06B6D4] z-10"
                />
              </motion.div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
              The Provably <br /> <span className="text-blue-500">Fair Engine</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base font-light tracking-wide leading-relaxed max-w-lg mb-8">
              Every hand is cryptographically sealed and verifiable on-chain, ensuring zero manipulation and absolute transparency.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#10182B] border-t border-white/20 p-6">
                <Cpu className="text-purple-400 mb-4" size={24} />
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Zero-Knowledge</h3>
                <p className="text-white/40 text-xs">Verify the shuffle without revealing the deck state.</p>
              </div>
              <div className="bg-[#10182B] border-t border-white/20 p-6">
                <Lock className="text-blue-400 mb-4" size={24} />
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Non-Custodial</h3>
                <p className="text-white/40 text-xs">Your keys, your chips. Direct settlement to your wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 2: THE STAKES */}
      <section className="relative w-full py-32 px-6 lg:px-12 bg-[#050816] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Enter the <span className="text-purple-500">Protocol</span>
            </h2>
            <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">High-stakes environments for algorithmic execution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#10182B] border-t border-blue-500/50 p-8 hover:bg-[#151f38] transition-all duration-300 group">
              <Activity className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-3">Global Liquidity</h3>
              <p className="text-white/50 text-sm leading-relaxed">Access unified liquidity pools across multiple chains. Play against the world's best without fragmentation.</p>
            </div>
            <div className="bg-[#10182B] border-t border-purple-500/50 p-8 hover:bg-[#151f38] transition-all duration-300 group">
              <Zap className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-3">Instant Settlement</h3>
              <p className="text-white/50 text-sm leading-relaxed">No withdrawal delays. Winnings are settled directly to your wallet via smart contract instantly.</p>
            </div>
            <div className="bg-[#10182B] border-t border-gold-500/50 p-8 hover:bg-[#151f38] transition-all duration-300 group" style={{ borderTopColor: 'rgba(251, 191, 36, 0.5)' }}>
              <UserX className="text-yellow-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-3">Anonymous Tiers</h3>
              <p className="text-white/50 text-sm leading-relaxed">Protect your edge. Participate in high-roller brackets with complete identity obfuscation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 3: THE INTERFACE (MIDNIGHT TABLE MOCK) */}
      <section className="relative w-full py-32 px-6 lg:px-12 bg-[#050816] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              The <span className="text-blue-500">Midnight</span> Table
            </h2>
            <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">High-fidelity confidential environment</p>
          </div>

          <div className="relative w-full max-w-5xl aspect-[21/9] bg-[#0A1020] border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] flex items-center justify-center overflow-hidden">
            {/* Table Surface */}
            <div className="absolute inset-x-20 bottom-10 top-20 bg-[#10182B] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.05)_inset]" style={{ borderRadius: '400px' }} />
            
            {/* Center Pot & Cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
              <div className="flex gap-2">
                {[
                  { value: 'A', suit: '♠', color: 'text-white' },
                  { value: 'K', suit: '♠', color: 'text-white' },
                  { value: 'Q', suit: '♠', color: 'text-white' },
                  { value: 'J', suit: '♠', color: 'text-white' },
                  { value: '10', suit: '♠', color: 'text-white' },
                ].map((card, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ ...TRANSITION, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="w-16 h-24 bg-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center"
                  >
                    <span className={`text-2xl font-serif ${card.color}`}>{card.value}</span>
                    <span className={`text-2xl font-serif ${card.color}`}>{card.suit}</span>
                  </motion.div>
                ))}
              </div>
              <div className="px-6 py-2 bg-black/50 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <span className="text-cyan-400 font-mono font-bold tracking-widest uppercase text-xs">Pot: $2.4M</span>
              </div>
            </div>

            {/* Player Seats (Glowing) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-purple-500/50 bg-gradient-to-b from-purple-500/20 to-transparent flex flex-col items-center justify-start pt-2 glow-purple z-10">
              <span className="text-white text-[10px] font-mono uppercase">0x7F...9A</span>
              <span className="text-purple-400 font-bold text-xs">$840K</span>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-20 border-b-2 border-blue-500 bg-gradient-to-t from-blue-500/30 to-transparent flex flex-col items-center justify-end pb-3 glow-blue z-10">
              <span className="text-white text-xs font-mono uppercase mb-1">0x3A...B2 (You)</span>
              <span className="text-blue-400 font-bold text-sm">$1.2M</span>
            </div>
            
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-16 h-32 border-l border-gold-500/50 bg-gradient-to-r from-yellow-500/20 to-transparent flex flex-col items-start justify-center pl-2 glow-gold z-10">
              <span className="text-white text-[10px] font-mono uppercase rotate-90 origin-left translate-x-4 mb-8">0x9C...1D</span>
            </div>
            
            <div className="absolute top-1/2 right-8 -translate-y-1/2 w-16 h-32 border-r border-white/20 bg-gradient-to-l from-white/5 to-transparent flex flex-col items-end justify-center pr-2 z-10">
              <span className="text-white/50 text-[10px] font-mono uppercase -rotate-90 origin-right -translate-x-4 mt-8">0x2F...4E</span>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 4: THE LOBBY (DATA GRID/BLOOMBERG TERMINAL STYLE) */}
      <section className="relative w-full py-32 px-6 lg:px-12 bg-[#0A1020] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                Active <span className="text-cyan-400">Nodes</span>
              </h2>
              <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em]">Real-time network lobby</p>
            </div>
            <Link
              href="/tables"
              className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:text-cyan-300 flex items-center gap-2"
            >
              Access All Tables <ArrowRight size={14} />
            </Link>
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
              {[
                { id: "M-NLH-8X9A", type: "No Limit Hold'em", stakes: "1K / 2K USDC", players: "6/8", pot: "$ 45.2K", status: "Open" },
                { id: "M-PLO-2B4F", type: "Pot Limit Omaha", stakes: "500 / 1K USDC", players: "4/6", pot: "$ 12.8K", status: "Open" },
                { id: "M-NLH-7C1X", type: "No Limit Hold'em", stakes: "10K / 20K USDC", players: "8/8", pot: "$ 240.5K", status: "Full" },
                { id: "M-NLH-9Y2K", type: "No Limit Hold'em", stakes: "50 / 100 USDC", players: "5/9", pot: "$ 1.2K", status: "Open" },
              ].map((row, i) => (
                <div 
                  key={i} 
                  className="grid grid-cols-6 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group cursor-pointer"
                >
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-cyan-400 font-bold">{row.id}</span>
                    <span className="text-white/40 text-[10px]">{row.type}</span>
                  </div>
                  <div className="text-white/80">{row.stakes}</div>
                  <div className="text-white/60">
                    <span className={row.status === "Full" ? "text-red-400" : "text-green-400"}>{row.players.split('/')[0]}</span>
                    /{row.players.split('/')[1]}
                  </div>
                  <div className="text-purple-400">{row.pot}</div>
                  <div className="text-right">
                    <button className="px-4 py-2 bg-transparent border border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 transition-colors uppercase tracking-widest text-[10px]">
                      {row.status === "Full" ? "Spectate" : "Join Node"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 px-6 border-t border-white/10 bg-[#050816] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white text-lg font-black tracking-tighter uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-none shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          Midnight
        </div>
        <div className="flex gap-6 text-xs font-mono uppercase text-white/40">
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Protocol</Link>
        </div>
        <div className="text-white/30 text-[10px] font-mono uppercase">
          © 2026 Midnight Protocol. All systems nominal.
        </div>
      </footer>
    </div>
  );
}
