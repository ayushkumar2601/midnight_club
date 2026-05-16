"use client";

import { GameLayout } from "@/components/game-layout";
import { 
  Trophy, 
  TrendingUp, 
  Flame, 
  Crown,
  Medal,
  Star,
  Shield,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";

// Mock leaderboard data
const TOP_PLAYERS = [
  { 
    rank: 1, 
    name: "CryptoKing", 
    address: "0x7f3a...8b2c", 
    winRate: 78,
    totalWinnings: "156.4 ETH",
    gamesPlayed: 342,
    proofScore: 99.8,
    reputation: "Legendary",
    streak: 12,
    change: "up",
  },
  { 
    rank: 2, 
    name: "AceHunter", 
    address: "0x2d4e...9f1a", 
    winRate: 72,
    totalWinnings: "124.8 ETH",
    gamesPlayed: 289,
    proofScore: 99.5,
    reputation: "Elite",
    streak: 8,
    change: "up",
  },
  { 
    rank: 3, 
    name: "NightOwl", 
    address: "0x8c7b...3e4d", 
    winRate: 69,
    totalWinnings: "98.2 ETH",
    gamesPlayed: 256,
    proofScore: 99.2,
    reputation: "Elite",
    streak: 5,
    change: "down",
  },
];

const PLAYERS = [
  { rank: 4, name: "ShadowFox", winRate: 67, totalWinnings: "87.5 ETH", gamesPlayed: 234, proofScore: 98.9, change: "up" },
  { rank: 5, name: "PokerPro", winRate: 65, totalWinnings: "76.3 ETH", gamesPlayed: 198, proofScore: 98.7, change: "same" },
  { rank: 6, name: "BlueChip", winRate: 64, totalWinnings: "71.9 ETH", gamesPlayed: 187, proofScore: 98.5, change: "down" },
  { rank: 7, name: "CardShark", winRate: 62, totalWinnings: "65.4 ETH", gamesPlayed: 176, proofScore: 98.2, change: "up" },
  { rank: 8, name: "HighRoller", winRate: 61, totalWinnings: "59.8 ETH", gamesPlayed: 165, proofScore: 97.9, change: "up" },
  { rank: 9, name: "LuckyDraw", winRate: 59, totalWinnings: "54.2 ETH", gamesPlayed: 154, proofScore: 97.6, change: "down" },
  { rank: 10, name: "RoyalFlush", winRate: 58, totalWinnings: "49.7 ETH", gamesPlayed: 143, proofScore: 97.3, change: "same" },
];

const SEASONAL_STATS = [
  { label: "Season", value: "Season 3" },
  { label: "Days Left", value: "24" },
  { label: "Prize Pool", value: "500 ETH" },
  { label: "Participants", value: "1,247" },
];

function TopPlayerCard({ player, position }: { player: typeof TOP_PLAYERS[0]; position: number }) {
  const heights = ["h-44", "h-36", "h-32"];
  const orders = ["order-2", "order-1", "order-3"];
  const sizes = ["w-16 h-16", "w-14 h-14", "w-12 h-12"];
  const badges = ["bg-yellow-400 text-black", "bg-white/20 text-white", "bg-orange-400/50 text-white"];
  
  return (
    <div className={`flex flex-col items-center ${orders[position]}`}>
      {/* Avatar and rank */}
      <div className="relative mb-3">
        <div className={`${sizes[position]} rounded-full bg-white/10 flex items-center justify-center`}>
          {position === 0 && <Crown size={28} className="text-yellow-400" />}
          {position === 1 && <Medal size={22} className="text-white/60" />}
          {position === 2 && <Star size={18} className="text-orange-400" />}
        </div>
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${badges[position]} flex items-center justify-center font-bold text-xs`}>
          {player.rank}
        </div>
      </div>

      {/* Podium */}
      <div className={`w-24 ${heights[position]} rounded-t-xl flex flex-col items-center justify-start pt-4 relative`}
        style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-white font-medium text-sm mb-1">{player.name}</span>
        <span className="text-white/30 text-xs font-mono">{player.address}</span>
        <div className="mt-2 text-green-400 font-semibold">{player.totalWinnings}</div>
        <div className="text-white/40 text-xs">{player.winRate}% win</div>
      </div>
    </div>
  );
}

function StatBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-white/60 transition-all duration-500" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <GameLayout>
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Leaderboard</h1>
          <p className="text-white/50 text-sm">The best players in the Midnight Hold&apos;em universe</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Top 3 Podium */}
            <div className="rounded-xl p-8 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-end justify-center gap-4">
                {TOP_PLAYERS.map((player, i) => (
                  <TopPlayerCard key={player.rank} player={player} position={i} />
                ))}
              </div>
            </div>

            {/* Full Rankings Table */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-white/40 text-xs font-medium">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Player</div>
                <div className="col-span-2">Win Rate</div>
                <div className="col-span-2">Winnings</div>
                <div className="col-span-2">Games</div>
                <div className="col-span-2">Proof</div>
              </div>

              {/* Top 3 in table */}
              {TOP_PLAYERS.map((player) => (
                <div key={player.rank} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                  <div className="col-span-1 flex items-center gap-2">
                    <span className={`font-medium ${player.rank === 1 ? "text-yellow-400" : player.rank === 2 ? "text-white/60" : "text-orange-400"}`}>
                      #{player.rank}
                    </span>
                    {player.change === "up" && <ChevronUp size={12} className="text-green-400" />}
                    {player.change === "down" && <ChevronDown size={12} className="text-red-400" />}
                    {player.change === "same" && <Minus size={12} className="text-white/20" />}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div>
                      <span className="text-white text-sm">{player.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50">{player.reputation}</span>
                        {player.streak > 0 && (
                          <span className="text-xs flex items-center gap-0.5 text-yellow-400">
                            <Flame size={10} /> {player.streak}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-white/80 text-sm mb-1">{player.winRate}%</div>
                    <StatBar value={player.winRate} />
                  </div>
                  <div className="col-span-2 text-green-400 text-sm">{player.totalWinnings}</div>
                  <div className="col-span-2 text-white/50 text-sm">{player.gamesPlayed}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Shield size={12} className="text-white/40" />
                    <span className="text-white/70 text-sm">{player.proofScore}%</span>
                  </div>
                </div>
              ))}

              {/* Remaining players */}
              {PLAYERS.map((player) => (
                <div key={player.rank} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                  <div className="col-span-1 flex items-center gap-2">
                    <span className="text-white/50 text-sm">#{player.rank}</span>
                    {player.change === "up" && <ChevronUp size={12} className="text-green-400" />}
                    {player.change === "down" && <ChevronDown size={12} className="text-red-400" />}
                    {player.change === "same" && <Minus size={12} className="text-white/20" />}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <span className="text-white/80 text-sm">{player.name}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="text-white/60 text-sm mb-1">{player.winRate}%</div>
                    <StatBar value={player.winRate} />
                  </div>
                  <div className="col-span-2 text-green-400 text-sm">{player.totalWinnings}</div>
                  <div className="col-span-2 text-white/50 text-sm">{player.gamesPlayed}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Shield size={12} className="text-white/40" />
                    <span className="text-white/60 text-sm">{player.proofScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-72 space-y-4">
            {/* Season Info */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
                <Trophy size={14} className="text-yellow-400" />
                Seasonal Rankings
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SEASONAL_STATS.map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-white/40 text-xs mb-1">{stat.label}</p>
                    <p className="text-white font-medium text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Tracker */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
                <Flame size={14} className="text-red-400" />
                Top Streaks
              </h3>
              <div className="space-y-2">
                {TOP_PLAYERS.map((player, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/10" />
                      <span className="text-white/70 text-sm">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Flame size={12} />
                      <span className="font-medium text-sm">{player.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Stats */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
                <TrendingUp size={14} className="text-white/50" />
                Your Ranking
              </h3>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-white mb-2">#247</div>
                <p className="text-white/40 text-sm">Top 20% of players</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs">Win Rate</p>
                    <p className="text-white font-medium">54%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs">Winnings</p>
                    <p className="text-green-400 font-medium">4.2 ETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
