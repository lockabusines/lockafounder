import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { MissionBoard } from '@/components/dashboard/MissionBoard'
import { HabitTracker } from '@/components/dashboard/HabitTracker'
import { CaptureBox } from '@/components/dashboard/CaptureBox'
import { MealPlanner } from '@/components/dashboard/MealPlanner'
import { ShoppingList } from '@/components/dashboard/ShoppingList'

const NAV_CARDS = [
  {
    href: '/mission',
    id: '05',
    label: 'Mission Control',
    title: 'Retire Mum',
    sub: 'Income streams · Gap tracker',
    accent: '#f5c842',
  },
  {
    href: '/crm',
    id: '06',
    label: 'CRM',
    title: 'Jobs & Clients',
    sub: 'Pipeline · Contacts · Revenue',
    accent: '#4db8ff',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />

      <main className="flex-1 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-3 max-w-5xl mx-auto">

          {/* Left column */}
          <div className="flex flex-col gap-3">
            <LevelCard />
            <HabitTracker />

            {/* Quick-nav cards */}
            {NAV_CARDS.map(({ href, id, label, title, sub, accent }) => (
              <Link key={href} href={href}>
                <div
                  className="glass p-4 flex items-center justify-between gap-3 cursor-pointer"
                  style={{ borderLeft: `2px solid ${accent}44` }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="section-id">{id} //</span>
                      <span className="label" style={{ color: accent }}>{label}</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>{title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>›</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3">
            <MissionBoard />
            <MealPlanner />
            <ShoppingList />

            {/* Telegram hint */}
            <div className="glass p-3 flex items-center gap-3">
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>📡</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                Send any message to your Telegram bot to log a quest, habit, or thought. Type{' '}
                <span style={{ color: '#4db8ff' }}>/today</span> for your daily brief.
              </span>
            </div>
          </div>

        </div>
      </main>

      <CaptureBox />
    </div>
  )
}
