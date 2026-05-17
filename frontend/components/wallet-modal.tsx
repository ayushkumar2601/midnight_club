"use client";

import { X, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    description: "Connect using browser extension",
  },
  {
    name: "WalletConnect",
    icon: "https://walletconnect.com/static/favicon.ico",
    description: "Scan with mobile wallet",
  },
  {
    name: "Coinbase Wallet",
    icon: "https://www.coinbase.com/favicon.ico",
    description: "Connect using Coinbase Wallet",
  },
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] transition-all duration-500"
        style={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300"
          style={{
            backgroundColor: "rgba(12,12,12,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors duration-200"
          >
            <X size={16} className="text-white/60" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Connect Wallet</h2>
            <p className="text-white/50 text-sm">Choose your preferred wallet to continue</p>
          </div>

          {/* Wallet Options */}
          <div className="space-y-2">
            {WALLETS.map((wallet, i) => (
              <button
                key={wallet.name}
                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 flex items-center gap-4 group"
                style={{
                  transitionDelay: `${i * 50}ms`,
                }}
                onClick={() => {
                  alert(`${wallet.name} connection would happen here`);
                  onClose();
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    {wallet.name}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-40 transition-opacity duration-200" />
                  </div>
                  <div className="text-white/40 text-xs">{wallet.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
