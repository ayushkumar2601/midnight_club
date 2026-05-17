"use client";

import { Wallet, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Platform", href: "/lobby" },
  { label: "Leaderboards", href: "/leaderboard" },
  { label: "Fairness", href: "/fairness" },
  { label: "Profile", href: "/profile" },
];

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
      style={{ backgroundColor: open ? "rgba(255,255,255,0.1)" : "transparent" }}
      aria-label="Toggle menu"
    >
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          opacity: open ? 0 : 1,
          transform: open ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        <Menu size={20} className="text-white" strokeWidth={1.5} />
      </span>
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
        }}
      >
        <X size={20} className="text-white" strokeWidth={1.5} />
      </span>
    </button>
  );
}

function MobileMenu({ open, onClose, onConnectWallet }: { open: boolean; onClose: () => void; onConnectWallet: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 lg:hidden transition-all duration-500"
        style={{
          backdropFilter: open ? "blur(12px)" : "blur(0px)",
          backgroundColor: open ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 left-0 right-0 z-40 lg:hidden overflow-hidden"
        style={{
          maxHeight: open ? "480px" : "0px",
          transition: "max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div
          className="pt-20 pb-6 px-5"
          style={{ 
            backgroundColor: "rgba(8,8,8,0.97)", 
            borderBottom: "1px solid rgba(255,255,255,0.08)" 
          }}
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="text-white/70 hover:text-white text-base py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
                style={{
                  transitionDelay: open ? `${i * 50 + 80}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(-8px)",
                  transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, color 0.2s, background 0.2s`,
                }}
              >
                {item.label}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            ))}
          </div>

          <div
            className="mt-5 pt-5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              transitionDelay: open ? "360ms" : "0ms",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(-8px)",
              transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) 360ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) 360ms`,
            }}
          >
            <button
              onClick={() => { onConnectWallet(); onClose(); }}
              className="w-full py-3 rounded-full bg-white text-black text-sm font-medium transition-all duration-300 hover:opacity-80 flex items-center justify-center gap-2"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface GameNavbarProps {
  onConnectWallet: () => void;
}

export function GameNavbar({ onConnectWallet }: GameNavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 lg:px-10 lg:py-5">
        {/* Logo */}
        <Link href="/" className="text-white text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
          midnight
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5" style={{ backgroundColor: "rgba(12,12,12,0.9)" }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm px-4 py-1.5 rounded-full transition-all duration-200 ${
                pathname === item.href 
                  ? "text-white bg-white/10" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          
          <button
            onClick={onConnectWallet}
            className="hidden lg:flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full bg-white text-black transition-all duration-300 hover:opacity-80"
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        </div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} onConnectWallet={onConnectWallet} />
    </>
  );
}
