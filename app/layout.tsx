import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: 'Midnight Hold\'em - Provably Fair Web3 Poker',
  description: 'A luxury confidential esports protocol for competitive poker. Cryptographically verified gameplay.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { SocketProvider } from '../lib/socket/SocketProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#050505]">
      <body className={`${outfit.variable} ${jetbrains.variable} font-sans antialiased bg-[#050505]`}>
        <SocketProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </SocketProvider>
      </body>
    </html>
  )
}
