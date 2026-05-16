"use client";

import { GameLayout } from "@/components/game-layout";
import { 
  Shield, 
  CheckCircle, 
  Lock, 
  Eye,
  Cpu,
  Database,
  Activity,
  RefreshCw,
  ExternalLink,
  Copy,
  Fingerprint,
  Layers,
  Zap,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";

// Mock verification data
const VERIFICATION_CARDS = [
  {
    title: "Shuffle Verification",
    description: "Every deck shuffle is cryptographically verified using zero-knowledge proofs",
    icon: RefreshCw,
    status: "verified",
    hash: "0x7f3a8b2c9d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
    timestamp: "2 seconds ago",
  },
  {
    title: "Hidden State Protection",
    description: "Player cards and deck state are encrypted and never exposed until reveal",
    icon: Eye,
    status: "verified",
    hash: "0x2d4e9f1a3b5c7d8e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    timestamp: "5 seconds ago",
  },
  {
    title: "Payout Verification",
    description: "All payouts are verified on-chain with transparent transaction records",
    icon: Database,
    status: "verified",
    hash: "0x8c7b3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    timestamp: "8 seconds ago",
  },
  {
    title: "Anti-Cheat Validation",
    description: "Continuous monitoring for suspicious patterns and automated enforcement",
    icon: Shield,
    status: "verified",
    hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    timestamp: "12 seconds ago",
  },
];

const LIVE_PROOFS = [
  { type: "Shuffle", tableId: "Diamond Room", status: "verified", time: "0:02" },
  { type: "Deal", tableId: "Platinum Lounge", status: "verified", time: "0:05" },
  { type: "Payout", tableId: "Elite Arena", status: "verified", time: "0:08" },
  { type: "Shuffle", tableId: "Neon Circuit", status: "verified", time: "0:12" },
  { type: "State", tableId: "Cyber Den", status: "verified", time: "0:15" },
];

const SYSTEM_METRICS = [
  { label: "Uptime", value: "99.99%", icon: Activity },
  { label: "Verifications", value: "124,892", icon: CheckCircle },
  { label: "Active Tables", value: "47", icon: Globe },
  { label: "Avg Response", value: "12ms", icon: Zap },
];

function VerificationCard({ card }: { card: typeof VERIFICATION_CARDS[0] }) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(card.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.04]"
      style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <card.icon size={18} className="text-white/50" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{card.title}</h3>
            <p className="text-white/30 text-xs">{card.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-400/10">
          <CheckCircle size={12} className="text-green-400" />
          <span className="text-green-400 text-xs font-medium">Verified</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/50 text-sm mb-4">{card.description}</p>

      {/* Hash */}
      <div>
        <p className="text-white/30 text-xs mb-1">Commitment Hash</p>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <code className="text-white/50 text-xs font-mono flex-1 truncate">{card.hash}</code>
          <button onClick={copyHash} className="text-white/30 hover:text-white transition-colors">
            {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveProofFeed() {
  const [proofs, setProofs] = useState(LIVE_PROOFS);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ["Shuffle", "Deal", "Payout", "State"];
      const tables = ["Diamond Room", "Platinum Lounge", "Elite Arena", "Neon Circuit", "Cyber Den"];
      
      setProofs((prev) => [
        {
          type: types[Math.floor(Math.random() * types.length)],
          tableId: tables[Math.floor(Math.random() * tables.length)],
          status: "verified",
          time: "0:00",
        },
        ...prev.slice(0, 4).map((p) => ({
          ...p,
          time: `0:${String(parseInt(p.time.split(":")[1]) + 3).padStart(2, "0")}`,
        })),
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
        <Activity size={14} className="text-white/50" />
        Live Verification Feed
        <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </h3>
      <div className="space-y-2">
        {proofs.map((proof, i) => (
          <div 
            key={`${proof.tableId}-${proof.time}-${i}`}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
          >
            <div className="flex items-center gap-3">
              <CheckCircle size={12} className="text-green-400" />
              <div>
                <span className="text-white/80 text-sm">{proof.type}</span>
                <span className="text-white/30 text-xs ml-2">{proof.tableId}</span>
              </div>
            </div>
            <span className="text-white/30 text-xs font-mono">{proof.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtocolTerminal() {
  const [lines, setLines] = useState([
    "> Initializing verification protocol...",
    "> Connecting to ZK-proof network...",
    "> Protocol active. Monitoring all tables.",
  ]);

  useEffect(() => {
    const commands = [
      "> Shuffle verified: 0x7f3a...8b2c",
      "> State commitment: VALID",
      "> Payout confirmed: 2.4 ETH",
      "> Anti-cheat scan: CLEAR",
      "> New block: #18,492,847",
      "> Proof submitted: Diamond Room",
      "> Verification complete: 12ms",
    ];

    const interval = setInterval(() => {
      setLines((prev) => [
        ...prev.slice(-5),
        commands[Math.floor(Math.random() * commands.length)],
      ]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl p-4 font-mono" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-white/30 text-xs">fairness_protocol.exe</span>
      </div>
      <div className="bg-black/30 rounded-lg p-4 h-40 overflow-hidden">
        {lines.map((line, i) => (
          <div 
            key={i}
            className={`text-xs ${line.includes("VALID") || line.includes("CLEAR") || line.includes("verified") || line.includes("confirmed") ? "text-green-400" : "text-white/50"}`}
          >
            {line}
          </div>
        ))}
        <span className="animate-pulse text-white/50">_</span>
      </div>
    </div>
  );
}

export default function FairnessPage() {
  return (
    <GameLayout>
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 mb-4">
            <Shield size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">100% Provably Fair</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Cryptographic Verification</h1>
          <p className="text-white/50 text-sm max-w-xl">
            Every shuffle, deal, and payout is verified using zero-knowledge proofs. 
            Complete transparency without compromising game integrity.
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {SYSTEM_METRICS.map((metric) => (
            <div key={metric.label} className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <metric.icon size={18} className="mx-auto mb-2 text-white/40" />
              <p className="text-xl font-semibold text-white">{metric.value}</p>
              <p className="text-white/40 text-xs">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Main Status Banner */}
        <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-400/10 flex items-center justify-center">
                <Shield size={28} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">All Systems Operational</h2>
                <p className="text-white/50 text-sm">Last verified: 2 seconds ago</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Lock, label: "Deck Verified" },
                { icon: Eye, label: "State Protected" },
                { icon: Cpu, label: "Winner Verified" },
                { icon: Database, label: "Payout Confirmed" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
                  <item.icon size={14} className="text-green-400" />
                  <span className="text-green-400 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Verification Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {VERIFICATION_CARDS.map((card) => (
                <VerificationCard key={card.title} card={card} />
              ))}
            </div>

            {/* Protocol Terminal */}
            <ProtocolTerminal />
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-72 space-y-4">
            {/* Live Feed */}
            <LiveProofFeed />

            {/* Technical Details */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
                <Fingerprint size={14} className="text-white/50" />
                Technical Stack
              </h3>
              <div className="space-y-2">
                {[
                  { label: "ZK-Proof System", value: "Groth16" },
                  { label: "Commitment Scheme", value: "Pedersen" },
                  { label: "RNG Source", value: "VRF Oracle" },
                  { label: "Settlement Layer", value: "Ethereum L2" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <span className="text-white text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verify External */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-2 text-sm">Verify Externally</h3>
              <p className="text-white/40 text-xs mb-4">
                All proofs can be independently verified on-chain.
              </p>
              <button className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/70 hover:text-white">
                <ExternalLink size={14} />
                <span className="text-sm">View on Explorer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
