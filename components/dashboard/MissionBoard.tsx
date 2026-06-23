'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  urgency: string
  xp_value: number
  mission_roi: number
  due_date?: string | null
}

const G = {
  gold:   '#f5c842',
  green:  '#1aff8c',
  blue:   '#4db8ff',
  red:    '#ff4455',
  muted:  'rgba(255,255,255,0.35)',
  faint:  'rgba(255,255,255,0.15)',
  border: 'rgba(255,255,255,0.07)',
}

function roiConfig(roi: number) {
  if (roi >= 5) return { label: 'MONEY MOVE', color: G.gold,  icon: '💰' }
  if (roi >= 4) return { label: 'HIGH ROI',   color: G.green, icon: '📈' }
  if (roi >= 3) return { label: 'MEDIUM ROI', color: G.blue,  icon: '🔧' }
  if (roi >= 2) return { label: 'LOW ROI',    color: G.muted, icon: '📋' }
  return              { label: 'NO ROI',      color: G.muted, icon: '📌' }
}

function isOverdue(due?: string | null) {
  if (!due) return false
  return new Date(due) < new Date(new Date().toDateString())
}

function isDueToday(due?: string | null) {
  if (!due) return false
  return due === new Date().toISOString().split('T')[0]
}

function dueBadge(due?: string | null) {
  if (!due) return null
  if (isOverdue(due))  return { text: 'OVERDUE',   color: G.red   }
  if (isDueToday(due)) return { text: 'TODAY',      color: G.gold  }
  const d = new Date(due)
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  if (diff <= 3)       return { text: `${diff}d`,   color: G.gold  }
  return               { text: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), color: G.muted }
}

export function MissionBoard() {
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
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

  async function setDue(id: string, due_date: string) {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, due_date: due_date || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks(t => t.map(x => x.id === id ? { ...x, due_date: updated.due_date } : x))
    }
  }

  const topMoves = tasks.filter(t => t.mission_roi >= 4).slice(0, 3)
  const rest     = tasks.filter(t => t.mission_roi < 4)

  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ borderLeft: `2px solid ${G.gold}44` }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: G.faint, fontSize: '0.58rem' }}>01 //</span>
            <span style={{ color: G.gold, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Main Mission</span>
          </div>
          <p className="text-base font-semibold text-white mt-0.5">Retire Mum 👑</p>
          <p className="text-xs mt-0.5" style={{ color: G.muted }}>Tasks ranked by how much they move the money needle.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 p-4">
          {[1,2,3].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: G.muted }}>No tasks yet.</p>
          <p className="text-xs mt-1" style={{ color: G.faint }}>Send a task via Telegram to get started.</p>
        </div>
      ) : (
        <>
          {topMoves.length > 0 && (
            <div style={{ borderBottom: `1px solid ${G.border}` }}>
              <p className="px-5 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: G.gold }}>Top Money Moves</p>
              {topMoves.map(task => <TaskRow key={task.id} task={task} completing={completing} onComplete={complete} onSetDue={setDue} highlight />)}
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {topMoves.length > 0 && <p className="px-5 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: G.muted }}>Other Quests</p>}
              {rest.map(task => <TaskRow key={task.id} task={task} completing={completing} onComplete={complete} onSetDue={setDue} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TaskRow({ task, completing, onComplete, onSetDue, highlight = false }: {
  task: Task
  completing: string | null
  onComplete: (id: string) => void
  onSetDue: (id: string, date: string) => void
  highlight?: boolean
}) {
  const roi         = roiConfig(task.mission_roi)
  const isCompleting = completing === task.id
  const badge       = dueBadge(task.due_date)
  const [showDate, setShowDate] = useState(false)

  return (
    <div className="flex items-center gap-3 px-5 py-3 transition-colors group"
      style={{ borderBottom: `1px solid ${G.border}`, background: highlight ? `${roi.color}06` : 'transparent' }}>

      {/* Checkbox */}
      <button onClick={() => !isCompleting && onComplete(task.id)} disabled={isCompleting}
        className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: isCompleting ? roi.color : 'rgba(255,255,255,0.2)' }}>
        {isCompleting && <span style={{ color: roi.color, fontSize: '0.6rem' }}>✓</span>}
      </button>

      {/* Title */}
      <span className="flex-1 text-sm leading-snug" style={{ color: 'rgba(230,230,230,0.9)' }}>{task.title}</span>

      {/* Due date badge + picker */}
      <div className="flex items-center gap-1.5 shrink-0">
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{ background: `${badge.color}15`, color: badge.color }}>
            {badge.text}
          </span>
        )}
        <button
          onClick={() => setShowDate(!showDate)}
          className="text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: G.muted, background: 'rgba(255,255,255,0.05)' }}
          title="Set due date">
          📅
        </button>
        {showDate && (
          <input type="date" defaultValue={task.due_date ?? ''}
            className="text-xs px-1.5 py-0.5 rounded w-32"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0' }}
            onChange={e => { onSetDue(task.id, e.target.value); setShowDate(false) }} />
        )}
      </div>

      {/* ROI + XP */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: `${roi.color}18`, color: roi.color }}>
          {roi.icon} {roi.label}
        </span>
        <span className="text-xs font-mono" style={{ color: G.blue }}>+{task.xp_value}</span>
      </div>
    </div>
  )
}
