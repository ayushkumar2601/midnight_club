"use client";

import { GameLayout } from "@/components/game-layout";
import { 
  Trophy, 
  TrendingUp, 
  Wallet,
  Clock,
  Play,
  Star,
  Target,
  Flame,
  Award,
  BarChart3,
  Copy,
  CheckCircle,
  ExternalLink,
  Settings,
  Edit3
} from "lucide-react";
import { useState } from "react";

// Mock player data
const PLAYER_DATA = {
  name: "CryptoKing",
  address: "0x7f3a8b2c9d4e5f6a1b2c3d4e5f6a7b8c",
  avatar: "#3B82F6",
  level: 42,
  rank: 247,
  reputation: "Diamond",
  memberSince: "Jan 2024",
  stats: {
    totalGames: 342,
    wins: 186,
    losses: 156,
    winRate: 54.4,
    totalWinnings: "12.5 ETH",
    biggestWin: "4.2 ETH",
    currentStreak: 5,
    bestStreak: 12,
    averagePot: "0.35 ETH",
    favoriteTable: "Diamond Room",
  },
  wallet: {
    balance: "4.25 ETH",
    pending: "0.15 ETH",
    totalDeposited: "10 ETH",
    totalWithdrawn: "5.75 ETH",
  },
};

const RECENT_MATCHES = [
  { id: 1, table: "Diamond Room", result: "win", amount: "+0.8 ETH", date: "2h ago", hands: 45 },
  { id: 2, table: "Platinum Lounge", result: "loss", amount: "-0.3 ETH", date: "5h ago", hands: 32 },
  { id: 3, table: "Elite Arena", result: "win", amount: "+1.2 ETH", date: "1d ago", hands: 67 },
  { id: 4, table: "Neon Circuit", result: "win", amount: "+0.5 ETH", date: "1d ago", hands: 28 },
  { id: 5, table: "Cyber Den", result: "loss", amount: "-0.4 ETH", date: "2d ago", hands: 41 },
  { id: 6, table: "Shadow Table", result: "win", amount: "+2.1 ETH", date: "3d ago", hands: 89 },
];

const ACHIEVEMENTS = [
  { name: "First Blood", description: "Win your first game", icon: Target, unlocked: true, color: "#10B981" },
  { name: "High Roller", description: "Win a pot over 5 ETH", icon: Star, unlocked: true, color: "#FBBF24" },
  { name: "Streak Master", description: "Win 10 games in a row", icon: Flame, unlocked: true, color: "#EF4444" },
  { name: "Diamond Hands", description: "Play 500 games", icon: Trophy, unlocked: false, color: "#8B5CF6", progress: 68 },
  { name: "Whale", description: "Win 100 ETH total", icon: Award, unlocked: false, color: "#3B82F6", progress: 12 },
  { name: "Legend", description: "Reach top 100 ranking", icon: TrendingUp, unlocked: false, color: "#06B6D4", progress: 45 },
];

const ANALYTICS_DATA = [
  { day: "Mon", wins: 4, losses: 2 },
  { day: "Tue", wins: 3, losses: 4 },
  { day: "Wed", wins: 6, losses: 1 },
  { day: "Thu", wins: 2, losses: 3 },
  { day: "Fri", wins: 5, losses: 2 },
  { day: "Sat", wins: 7, losses: 3 },
  { day: "Sun", wins: 4, losses: 2 },
];

function StatCard({ label, value, icon: Icon, color, subtext }: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
      {subtext && <p className="text-white/30 text-xs mt-1">{subtext}</p>}
    </div>
  );
}

function WinRateChart() {
  const maxValue = Math.max(...ANALYTICS_DATA.map(d => d.wins + d.losses));
  
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-[#3B82F6]" />
        Weekly Performance
      </h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {ANALYTICS_DATA.map((day) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-0.5">
              <div 
                className="w-full rounded-t bg-[#10B981] transition-all duration-500"
                style={{ height: `${(day.wins / maxValue) * 80}px` }}
              />
              <div 
                className="w-full rounded-b bg-[#EF4444] transition-all duration-500"
                style={{ height: `${(day.losses / maxValue) * 80}px` }}
              />
            </div>
            <span className="text-white/40 text-xs">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#10B981]" />
          <span className="text-white/60 text-xs">Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#EF4444]" />
          <span className="text-white/60 text-xs">Losses</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(PLAYER_DATA.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GameLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-8">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-transparent to-[#8B5CF6]/10" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PLAYER_DATA.avatar}, ${PLAYER_DATA.avatar}88)` }}
              >
                {PLAYER_DATA.name.slice(0, 2)}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center">
                <span className="text-black font-bold text-sm">{PLAYER_DATA.level}</span>
              </div>
              {/* Edit button */}
              <button className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Edit3 size={14} className="text-white/60" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{PLAYER_DATA.name}</h1>
                <span className="px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-sm font-medium">
                  {PLAYER_DATA.reputation}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <code className="text-white/40 text-sm font-mono">{PLAYER_DATA.address}</code>
                <button onClick={copyAddress} className="text-white/40 hover:text-white transition-colors">
                  {copied ? <CheckCircle size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                </button>
                <button className="text-white/40 hover:text-white transition-colors">
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-[#FBBF24]" />
                  <span className="text-white/60">Rank <span className="text-white font-medium">#{PLAYER_DATA.rank}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-[#EF4444]" />
                  <span className="text-white/60">Streak <span className="text-white font-medium">{PLAYER_DATA.stats.currentStreak}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-white/40" />
                  <span className="text-white/60">Member since {PLAYER_DATA.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <button className="absolute top-4 right-4 md:relative md:top-auto md:right-auto w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Settings size={18} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                label="Total Games" 
                value={PLAYER_DATA.stats.totalGames.toString()} 
                icon={Target}
                color="#3B82F6"
              />
              <StatCard 
                label="Win Rate" 
                value={`${PLAYER_DATA.stats.winRate}%`} 
                icon={TrendingUp}
                color="#10B981"
                subtext={`${PLAYER_DATA.stats.wins}W - ${PLAYER_DATA.stats.losses}L`}
              />
              <StatCard 
                label="Total Winnings" 
                value={PLAYER_DATA.stats.totalWinnings} 
                icon={Trophy}
                color="#FBBF24"
              />
              <StatCard 
                label="Biggest Win" 
                value={PLAYER_DATA.stats.biggestWin} 
                icon={Star}
                color="#8B5CF6"
              />
            </div>

            {/* Win Rate Chart */}
            <WinRateChart />

            {/* Recent Matches */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-[#06B6D4]" />
                  Recent Matches
                </h3>
                <button className="text-[#3B82F6] text-sm hover:underline">View All</button>
              </div>
              <div className="divide-y divide-white/5">
                {RECENT_MATCHES.map((match) => (
                  <div key={match.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        match.result === "win" ? "bg-[#10B981]/20" : "bg-[#EF4444]/20"
                      }`}>
                        {match.result === "win" ? (
                          <Trophy size={18} className="text-[#10B981]" />
                        ) : (
                          <Target size={18} className="text-[#EF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{match.table}</p>
                        <p className="text-white/40 text-xs">{match.hands} hands</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${match.result === "win" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {match.amount}
                      </p>
                      <p className="text-white/30 text-xs">{match.date}</p>
                    </div>
                    <button className="ml-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Play size={14} className="text-white/60" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award size={18} className="text-[#FBBF24]" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((achievement) => (
                  <div 
                    key={achievement.name}
                    className={`rounded-xl p-4 ${achievement.unlocked ? "bg-white/5" : "bg-white/[0.02]"} relative overflow-hidden`}
                  >
                    {!achievement.unlocked && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${achievement.progress}%`,
                            background: achievement.color,
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${achievement.unlocked ? "" : "opacity-30"}`}
                        style={{ backgroundColor: `${achievement.color}20` }}
                      >
                        <achievement.icon size={18} style={{ color: achievement.color }} />
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle size={14} className="text-[#10B981] ml-auto" />
                      )}
                    </div>
                    <p className={`font-medium text-sm ${achievement.unlocked ? "text-white" : "text-white/40"}`}>
                      {achievement.name}
                    </p>
                    <p className="text-white/30 text-xs">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <p className="text-white/40 text-xs mt-1">{achievement.progress}% complete</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 space-y-4">
            {/* Wallet Section */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-[#3B82F6]" />
                Wallet
              </h3>
              <div className="text-center py-4 mb-4 bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 rounded-xl">
                <p className="text-white/40 text-xs mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-white">{PLAYER_DATA.wallet.balance}</p>
                {parseFloat(PLAYER_DATA.wallet.pending) > 0 && (
                  <p className="text-[#FBBF24] text-xs mt-1">+{PLAYER_DATA.wallet.pending} pending</p>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Total Deposited</span>
                  <span className="text-white">{PLAYER_DATA.wallet.totalDeposited}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Total Withdrawn</span>
                  <span className="text-white">{PLAYER_DATA.wallet.totalWithdrawn}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Deposit
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                  Withdraw
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Best Streak</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Flame size={14} className="text-[#EF4444]" /> {PLAYER_DATA.stats.bestStreak}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Avg Pot Size</span>
                  <span className="text-white font-medium">{PLAYER_DATA.stats.averagePot}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Favorite Table</span>
                  <span className="text-white font-medium">{PLAYER_DATA.stats.favoriteTable}</span>
                </div>
              </div>
            </div>

            {/* Replay History */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Play size={18} className="text-[#8B5CF6]" />
                Saved Replays
              </h3>
              <div className="space-y-2">
                {RECENT_MATCHES.slice(0, 3).map((match) => (
                  <button 
                    key={match.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <Play size={14} className="text-white/40" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{match.table}</p>
                      <p className="text-white/40 text-xs">{match.date}</p>
                    </div>
                    <span className={`text-xs font-medium ${match.result === "win" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {match.amount}
                    </span>
                  </button>
                ))}
              </div>
              <button className="w-full mt-3 py-2 text-[#3B82F6] text-sm hover:underline">
                View All Replays
              </button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
