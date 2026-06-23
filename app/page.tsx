import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { MissionBoard } from '@/components/dashboard/MissionBoard'
import { HabitTracker } from '@/components/dashboard/HabitTracker'
import { CaptureBox } from '@/components/dashboard/CaptureBox'
import { MealPlanner } from '@/components/dashboard/MealPlanner'
import { ShoppingList } from '@/components/dashboard/ShoppingList'

const MUTED = 'rgba(100,140,180,0.55)'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />

      <main className="flex-1 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 max-w-5xl mx-auto">

          {/* Left — Identity */}
          <div className="flex flex-col gap-4">
            <LevelCard />
            <HabitTracker />
            {/* Mission Control link */}
            <Link href="/mission">
              <div
                className="glass p-4 flex items-center justify-between gap-3 cursor-pointer transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(255,200,0,0.35)', background: 'rgba(255,180,0,0.04)' }}
              >
                <div>
                  <p className="label" style={{ color: 'rgba(255,200,0,0.8)' }}>Mission Control</p>
                  <p className="text-sm font-bold text-white mt-0.5">Retire Mum 👑</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>Income streams · Gap tracker</p>
                </div>
                <span className="text-xl" style={{ color: 'rgba(255,200,0,0.6)' }}>→</span>
              </div>
            </Link>

            {/* CRM link */}
            <Link href="/crm">
              <div
                className="glass p-4 flex items-center justify-between gap-3 cursor-pointer transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(0,200,255,0.35)', background: 'rgba(0,180,255,0.04)' }}
              >
                <div>
                  <p className="label" style={{ color: 'rgba(0,200,255,0.8)' }}>CRM</p>
                  <p className="text-sm font-bold text-white mt-0.5">Jobs & Clients 📋</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>Pipeline · Contacts · Revenue</p>
                </div>
                <span className="text-xl" style={{ color: 'rgba(0,200,255,0.6)' }}>→</span>
              </div>
            </Link>
          </div>

          {/* Right — Quests + nutrition */}
          <div className="flex flex-col gap-4">
            <MissionBoard />
            <MealPlanner />
            <ShoppingList />

            {/* Quick capture hint */}
            <div
              className="glass p-4 flex items-center gap-3 text-sm"
              style={{ borderColor: 'oklch(0.28 0.025 264 / 0.4)' }}
            >
              <span style={{ color: 'oklch(0.45 0.010 264)' }}>📡</span>
              <span style={{ color: 'oklch(0.45 0.010 264)' }}>
                Send any message to your Telegram bot to log a quest, habit, or thought.
                Type <strong style={{ color: 'oklch(0.65 0.20 250)' }}>/today</strong> for your daily brief.
              </span>
            </div>
          </div>

        </div>
      </main>

      <CaptureBox />
    </div>
  )
}
