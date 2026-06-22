'use client'

import { useEffect, useState } from 'react'

interface Task { id: string; title: string; urgency: string; xp_value: number; category: string }

const URGENCY_COLOR: Record<string, string> = {
  today:      'oklch(0.62 0.22 25)',
  this_week:  'oklch(0.78 0.18 80)',
  this_month: 'oklch(0.65 0.20 250)',
  someday:    'oklch(0.45 0.010 264)',
}

export function QuestList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completing, setCompleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await fetch('/api/tasks')
      if (r.ok) setTasks(await r.json())
    } finally {
      setLoading(false)
    }
  }

  async function complete(id: string, xp: number) {
    setCompleting(id)
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    setTasks(t => t.filter(x => x.id !== id))
    setCompleting(null)
  }

  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="label">Active Quests</p>
        <span className="text-xs" style={{ color: 'oklch(0.55 0.010 264)' }}>{tasks.length} open</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 py-1">
          {[1,2,3].map(i => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />)}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'oklch(0.40 0.008 264)' }}>
          Queue clear. Send a task via Telegram.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {tasks.map(task => (
            <div key={task.id} className="quest-item group">
              <button
                onClick={() => complete(task.id, task.xp_value)}
                disabled={completing === task.id}
                className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all hover:border-white/40"
                style={{ borderColor: 'oklch(0.30 0.008 264 / 0.8)' }}
              >
                {completing === task.id && <span className="text-xs">✓</span>}
              </button>
              <span className="flex-1 text-sm text-white/80 leading-snug">{task.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono" style={{ color: 'oklch(0.65 0.20 250)' }}>+{task.xp_value}</span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: URGENCY_COLOR[task.urgency] ?? URGENCY_COLOR.someday }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
