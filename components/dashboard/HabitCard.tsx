'use client'

import { useState } from 'react'
import { Panel } from './Panel'

const DEFAULT_HABITS = [
  'Exercise',
  'Read 30m',
  'No alcohol',
  'Cold shower',
  'Meditate',
  'Review goals',
]

export function HabitCard() {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const done = checked.size
  const total = DEFAULT_HABITS.length
  const pct = Math.round((done / total) * 100)

  return (
    <Panel
      title="Habits"
      badge={
        <span className="mono text-[10px] text-[var(--color-ink-3)]">
          {done}/{total}
        </span>
      }
    >
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[var(--color-ink-2)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-ok)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {DEFAULT_HABITS.map((habit, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-2.5 text-left group"
          >
            <span
              className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                checked.has(i)
                  ? 'bg-[var(--color-ok)] border-[var(--color-ok)]'
                  : 'border-[var(--color-border)] group-hover:border-[var(--color-ink-3)]'
              }`}
            >
              {checked.has(i) && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className={`text-xs transition-colors ${checked.has(i) ? 'text-[var(--color-ink-3)] line-through' : 'text-[var(--color-ink-5)]'}`}>
              {habit}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[var(--color-ink-2)]">Syncs to Supabase once connected</p>
    </Panel>
  )
}
