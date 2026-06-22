'use client'

import { useEffect, useState } from 'react'

interface Habit {
  id: string; name: string; icon: string; category: string
  current_streak: number; longest_streak: number; xp_value: number
  last_completed: string | null; frequency: string; frequency_days: number[] | null
}

function isDueToday(h: Habit): boolean {
  const dow = new Date().getDay()
  if (h.frequency === 'daily') return true
  if (h.frequency === 'weekdays') return dow >= 1 && dow <= 5
  if (h.frequency === 'custom' && h.frequency_days) return h.frequency_days.includes(dow)
  return false
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logging, setLogging] = useState<string | null>(null)

  useEffect(() => { fetch('/api/habits').then(r => r.json()).then(setHabits).catch(() => {}) }, [])

  const today = new Date().toISOString().slice(0, 10)
  const due = habits.filter(isDueToday)
  const done = due.filter(h => h.last_completed === today).length

  async function logHabit(id: string) {
    setLogging(id)
    const r = await fetch(`/api/habits/${id}/complete`, { method: 'POST' })
    if (r.ok) {
      const updated: Habit = await r.json()
      setHabits(prev => prev.map(h => h.id === id ? updated : h))
    }
    setLogging(null)
  }

  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="label">Daily Habits</p>
        <span className="text-xs font-mono" style={{ color: done === due.length && due.length > 0 ? 'oklch(0.68 0.18 145)' : 'oklch(0.55 0.010 264)' }}>
          {done}/{due.length}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {due.map(habit => {
          const completed = habit.last_completed === today
          return (
            <button
              key={habit.id}
              onClick={() => !completed && logHabit(habit.id)}
              disabled={completed || logging === habit.id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg transition-all text-left"
              style={{ opacity: completed ? 0.5 : 1, cursor: completed ? 'default' : 'pointer' }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0 transition-all"
                style={{
                  background: completed ? 'oklch(0.68 0.18 145 / 0.2)' : 'oklch(0.18 0.015 264)',
                  border: `1px solid ${completed ? 'oklch(0.68 0.18 145 / 0.5)' : 'oklch(0.30 0.008 264)'}`,
                }}
              >
                {completed ? '✓' : habit.icon}
              </div>
              <span className="flex-1 text-sm" style={{ color: completed ? 'oklch(0.45 0.010 264)' : 'oklch(0.85 0.008 264)' }}>
                {habit.name}
              </span>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono" style={{ color: 'oklch(0.78 0.18 80)' }}>
                  🔥 {habit.current_streak}d
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
