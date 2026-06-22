import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SpaceBackground } from '@/components/SpaceBackground'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solo Life OS',
  description: 'Mission: Retire Mum',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SpaceBackground />
        {children}
      </body>
    </html>
  )
}
