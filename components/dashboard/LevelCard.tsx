'use client'

import { useEffect, useState } from 'react'
import { rankTitle } from '@/lib/game/xp'

interface Stats {
  level: number; xp: number; xp_next_level: number
  discipline: number; wealth: number; health: number; charisma: number; business: number
}

const STATS = [
  { key: 'health',     label: 'Health',     color: 'oklch(0.68 0.18 145)' },
  { key: 'discipline', label: 'Discipline', color: 'oklch(0.65 0.20 250)' },
  { key: 'wealth',     label: 'Wealth',     color: 'oklch(0.78 0.18 80)'  },
  { key: 'charisma',   label: 'Charisma',   color: 'oklch(0.60 0.22 295)' },
  { key: 'business',   label: 'Business',   color: 'oklch(0.72 0.18 40)'  },
]

export function LevelCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const level = stats?.level ?? 1
  const xp = stats?.xp ?? 0
  const xpNext = stats?.xp_next_level ?? 150
  const pct = Math.round((xp / xpNext) * 100)
  const maxStat = Math.max(...STATS.map(s => (stats as Record<string, number> | null)?.[s.key] ?? 0), 1)

  if (loading) return (
    <div className="glass glow-blue p-5 flex flex-col gap-4">
      <div className="h-6 w-32 rounded animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />
      <div className="h-10 w-20 rounded animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />
    </div>
  )

  return (
    <div className="glass glow-blue p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Solo Life OS</p>
          <p className="text-xl font-bold text-white mt-0.5">Locka</p>
        </div>
        <div className="text-right">
          <div
            className="rank-badge"
            style={{ color: 'oklch(0.78 0.18 80)', borderColor: 'oklch(0.78 0.18 80 / 0.4)' }}
          >
            {rankTitle(level)}
          </div>
        </div>
      </div>

      {/* Level + XP */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black" style={{ color: 'oklch(0.65 0.20 250)' }}>{level}</span>
            <span className="text-sm text-white/40 font-medium">LEVEL</span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'oklch(0.55 0.010 264)' }}>
            {xp} / {xpNext} XP
          </span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <hr className="divider" />

      {/* Stats */}
      <div className="flex flex-col gap-2.5">
        {STATS.map(({ key, label, color }) => {
          const val = (stats as Record<string, number> | null)?.[key] ?? 0
          const pct = maxStat > 0 ? Math.round((val / maxStat) * 100) : 0
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="label w-20 shrink-0">{label}</span>
              <div className="stat-bar flex-1">
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.6s' }} />
              </div>
              <span className="mono text-xs w-6 text-right" style={{ color: 'oklch(0.55 0.010 264)' }}>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
