'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  urgency: string
  xp_value: number
  mission_roi: number
}

const GOLD   = 'oklch(0.78 0.18 80)'
const GREEN  = 'oklch(0.68 0.18 145)'
const BLUE   = 'oklch(0.65 0.20 250)'
const RED    = 'oklch(0.62 0.22 25)'
const MUTED  = 'oklch(0.40 0.008 264)'

function roiConfig(roi: number) {
  if (roi >= 5) return { label: 'MONEY MOVE',  color: GOLD,  icon: '💰' }
  if (roi >= 4) return { label: 'HIGH ROI',     color: GREEN, icon: '📈' }
  if (roi >= 3) return { label: 'MEDIUM ROI',   color: BLUE,  icon: '🔧' }
  if (roi >= 2) return { label: 'LOW ROI',       color: MUTED, icon: '📋' }
  return              { label: 'NO ROI',         color: MUTED, icon: '📌' }
}

export function MissionBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setTasks(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function complete(id: string) {
    setCompleting(id)
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    setTasks(t => t.filter(x => x.id !== id))
    setCompleting(null)
  }

  // Top 3 highest ROI tasks for the highlight strip
  const topMoves = tasks.filter(t => t.mission_roi >= 4).slice(0, 3)
  const rest = tasks.filter(t => t.mission_roi < 4)

  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ border: `1px solid ${GOLD}33` }}>

      {/* Mission banner */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid oklch(0.20 0.015 264)`, background: `${GOLD}08` }}
      >
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
            Main Mission
          </p>
          <p className="text-base font-bold text-white mt-0.5">Retire Mum 👑</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            Every quest is ranked by how much it moves the money needle.
          </p>
        </div>
        <div
          className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center rounded-xl"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40` }}
        >
          🏠
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 p-4">
          {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: MUTED }}>No quests yet.</p>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.30 0.008 264)' }}>
            Send a task via Telegram — it gets scored automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Top money moves */}
          {topMoves.length > 0 && (
            <div style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}>
              <p className="px-5 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: GOLD }}>
                Top Money Moves
              </p>
              {topMoves.map(task => (
                <TaskRow key={task.id} task={task} completing={completing} onComplete={complete} highlight />
              ))}
            </div>
          )}

          {/* Rest of quests */}
          {rest.length > 0 && (
            <div>
              {topMoves.length > 0 && (
                <p className="px-5 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: MUTED }}>
                  Other Quests
                </p>
              )}
              {rest.map(task => (
                <TaskRow key={task.id} task={task} completing={completing} onComplete={complete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TaskRow({ task, completing, onComplete, highlight = false }: {
  task: Task
  completing: string | null
  onComplete: (id: string) => void
  highlight?: boolean
}) {
  const roi = roiConfig(task.mission_roi)
  const isCompleting = completing === task.id

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 transition-all"
      style={{
        background: highlight ? `${roi.color}08` : 'transparent',
        borderBottom: '1px solid oklch(0.15 0.010 264)',
      }}
    >
      {/* Complete button */}
      <button
        onClick={() => !isCompleting && onComplete(task.id)}
        disabled={isCompleting}
        className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: isCompleting ? roi.color : 'oklch(0.30 0.008 264 / 0.8)' }}
      >
        {isCompleting && <span className="text-[10px]" style={{ color: roi.color }}>✓</span>}
      </button>

      {/* Title */}
      <span className="flex-1 text-sm leading-snug" style={{ color: 'oklch(0.88 0.008 264)' }}>
        {task.title}
      </span>

      {/* ROI badge + XP */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: `${roi.color}20`, color: roi.color }}
        >
          {roi.icon} {roi.label}
        </span>
        <span className="text-xs font-mono" style={{ color: BLUE }}>+{task.xp_value}</span>
      </div>
    </div>
  )
}
