"use client";

import { GameLayout } from "@/components/game-layout";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  MessageSquare,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Card suits and values
const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

// Mock game state
const GAME_STATE = {
  pot: "2.4 ETH",
  round: "Turn",
  communityCards: [
    { suit: "hearts", value: "A" },
    { suit: "spades", value: "K" },
    { suit: "diamonds", value: "7" },
    { suit: "clubs", value: "2" },
    null,
  ],
  players: [
    { 
      id: 1, 
      name: "You", 
      chips: "1.2 ETH", 
      position: "bottom",
      cards: [{ suit: "hearts", value: "K" }, { suit: "hearts", value: "Q" }],
      isActive: true,
      bet: "0.2 ETH",
      isUser: true,
    },
    { 
      id: 2, 
      name: "0xCrypto...", 
      chips: "0.8 ETH", 
      position: "top",
      cards: [null, null],
      isActive: false,
      bet: "0.2 ETH",
      isUser: false,
    },
  ],
};

const HAND_HISTORY = [
  { action: "You raised", amount: "0.2 ETH", time: "0:45" },
  { action: "0xCrypto... called", amount: "0.2 ETH", time: "0:38" },
  { action: "Flop dealt", cards: "A K 7", time: "0:30" },
  { action: "You checked", time: "0:25" },
  { action: "0xCrypto... bet", amount: "0.1 ETH", time: "0:18" },
  { action: "You called", amount: "0.1 ETH", time: "0:12" },
  { action: "Turn dealt", cards: "2", time: "0:05" },
];

function PlayingCard({ suit, value, faceDown = false, small = false }: { 
  suit?: typeof SUITS[number]; 
  value?: typeof VALUES[number]; 
  faceDown?: boolean;
  small?: boolean;
}) {
  const isRed = suit === "hearts" || suit === "diamonds";
  const suitSymbol = {
    hearts: "H",
    diamonds: "D",
    clubs: "C",
    spades: "S",
  };

  if (faceDown) {
    return (
      <div className={`${small ? "w-10 h-14" : "w-14 h-20"} rounded-lg relative overflow-hidden bg-white/5 border border-white/10`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${small ? "w-10 h-14" : "w-14 h-20"} rounded-lg relative overflow-hidden bg-white border border-white/20`}>
      <div className={`absolute top-1 left-1.5 ${small ? "text-xs" : "text-sm"} font-bold ${isRed ? "text-red-500" : "text-gray-800"}`}>
        {value}
        <div className={small ? "text-[10px]" : "text-xs"}>{suit && suitSymbol[suit]}</div>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center ${small ? "text-lg" : "text-2xl"} ${isRed ? "text-red-500" : "text-gray-800"}`}>
        {suit && suitSymbol[suit]}
      </div>
    </div>
  );
}

function PlayerSeat({ player, position }: { player: typeof GAME_STATE.players[0]; position: "top" | "bottom" }) {
  return (
    <div className="flex flex-col items-center">
      {/* Cards */}
      <div className="flex gap-1 mb-3">
        {player.cards.map((card, i) => (
          <div key={i}>
            <PlayingCard 
              suit={card?.suit as typeof SUITS[number]} 
              value={card?.value as typeof VALUES[number]} 
              faceDown={!card}
            />
          </div>
        ))}
      </div>

      {/* Player info */}
      <div className={`rounded-xl px-4 py-3 text-center relative ${player.isActive ? "ring-1 ring-white/30" : ""}`}
        style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {player.isActive && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-[10px] text-black font-medium">
            Your Turn
          </div>
        )}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/10" />
          <span className="text-white font-medium text-sm">{player.name}</span>
        </div>
        <div className="text-white/50 text-xs font-mono">{player.chips}</div>
        {player.bet && (
          <div className="mt-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-medium">
            Bet: {player.bet}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, variant, onClick, disabled = false }: { 
  label: string; 
  variant: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-white text-black hover:opacity-80",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {label}
    </button>
  );
}

export default function GamePage() {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <GameLayout>
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 pb-12">
        {/* Back button */}
        <Link href="/lobby" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors duration-200">
          <ChevronLeft size={16} />
          Back to Lobby
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Game Area */}
          <div className="flex-1">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-white">Diamond Room</h1>
                <p className="text-white/40 text-sm font-mono">Blinds: 0.01/0.02 ETH</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Shield size={14} className="text-green-400" />
                  <span className="text-green-400 text-sm">Verified</span>
                </div>
                <div className="rounded-lg px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Clock size={14} className="text-white/50" />
                  <span className="text-white/50 text-sm font-mono">12:45</span>
                </div>
              </div>
            </div>

            {/* Poker Table */}
            <div className="relative rounded-2xl p-8 min-h-[450px] flex flex-col items-center justify-between overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Opponent at top */}
              <div className="relative z-10">
                <PlayerSeat player={GAME_STATE.players[1]} position="top" />
              </div>

              {/* Table center */}
              <div className="relative z-10 flex flex-col items-center my-6">
                {/* Pot display */}
                <div className="mb-4 px-5 py-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <span className="text-white/70">Pot: </span>
                  <span className="text-white font-medium">{GAME_STATE.pot}</span>
                </div>

                {/* Community cards */}
                <div className="flex gap-2 mb-4">
                  {GAME_STATE.communityCards.map((card, i) => (
                    <div key={i} className={card ? "" : "opacity-30"}>
                      {card ? (
                        <PlayingCard suit={card.suit as typeof SUITS[number]} value={card.value as typeof VALUES[number]} />
                      ) : (
                        <div className="w-14 h-20 rounded-lg border border-dashed border-white/20" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Round indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Round:</span>
                  <span className="text-white font-medium">{GAME_STATE.round}</span>
                </div>

                {/* Proof badge */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400/80">
                  <CheckCircle size={12} />
                  <span>Shuffle verified</span>
                </div>
              </div>

              {/* Player at bottom */}
              <div className="relative z-10">
                <PlayerSeat player={GAME_STATE.players[0]} position="bottom" />
              </div>
            </div>

            {/* Betting Controls */}
            <div className="mt-4 rounded-xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Raise slider */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-sm">Raise Amount</span>
                    <span className="text-white font-mono text-sm">{(sliderValue / 100 * 1.2).toFixed(2)} ETH</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10"
                    style={{
                      background: `linear-gradient(to right, white ${sliderValue}%, rgba(255,255,255,0.1) ${sliderValue}%)`,
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <ActionButton label="Fold" variant="danger" />
                  <ActionButton label="Call 0.2 ETH" variant="secondary" />
                  <ActionButton label="Raise" variant="primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-72 space-y-4">
            {/* Hand History */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                <Clock size={14} className="text-white/50" />
                Hand History
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {HAND_HISTORY.map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white/70 text-sm">{item.action}</p>
                      {item.amount && <p className="text-yellow-400 text-xs">{item.amount}</p>}
                      {item.cards && <p className="text-white/40 text-xs font-mono">{item.cards}</p>}
                    </div>
                    <span className="text-white/30 text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Feed */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                <Shield size={14} className="text-green-400" />
                Verification
              </h3>
              <div className="space-y-2">
                {["Deck shuffle verified", "Hidden state protected", "Commitment: 0x7f3a..."].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Replay Controls */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                <Play size={14} className="text-white/50" />
                Replay
              </h3>
              <div className="flex items-center justify-center gap-3">
                <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <SkipBack size={14} className="text-white/50" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Pause size={16} className="text-black" />
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <SkipForward size={14} className="text-white/50" />
                </button>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-white" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={14} className="text-white/50" />
                  <span className="text-white/50 text-xs">Chat</span>
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Volume2 size={14} className="text-white/50" />
                  <span className="text-white/50 text-xs">Sound</span>
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Maximize2 size={14} className="text-white/50" />
                  <span className="text-white/50 text-xs">Full</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
