import { create } from 'zustand';

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  balance: number;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  balance: 0,
  isConnecting: false,
  connect: () => {
    set({ isConnecting: true });
    // Mock connection
    setTimeout(() => {
      set({
        address: '0x3A8F...B291',
        isConnected: true,
        balance: 50000,
        isConnecting: false,
      });
    }, 1000);
  },
  disconnect: () => set({ address: null, isConnected: false, balance: 0 }),
}));
