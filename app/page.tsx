import { TopRail } from '@/components/dashboard/TopRail'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { QuestList } from '@/components/dashboard/QuestList'
import { HabitTracker } from '@/components/dashboard/HabitTracker'
import { CaptureBox } from '@/components/dashboard/CaptureBox'
import { MealPlanner } from '@/components/dashboard/MealPlanner'
import { ShoppingList } from '@/components/dashboard/ShoppingList'

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
          </div>

          {/* Right — Quests + nutrition */}
          <div className="flex flex-col gap-4">
            <QuestList />
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
