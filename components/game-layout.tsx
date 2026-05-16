"use client";

import { useState } from "react";
import { GameNavbar } from "./game-navbar";
import { WalletModal } from "./wallet-modal";

export function GameLayout({ children }: { children: React.ReactNode }) {
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a0a]" />
        {/* Very subtle ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
      </div>

      <GameNavbar onConnectWallet={() => setWalletModalOpen(true)} />
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />

      <main className="relative z-10 pt-20 lg:pt-24">
        {children}
      </main>
    </div>
  );
}
