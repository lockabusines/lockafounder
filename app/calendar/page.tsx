'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const G = {
  green:  '#1aff8c',
  red:    '#ff4455',
  gold:   '#f5c842',
  blue:   '#4db8ff',
  purple: '#a78bfa',
  muted:  'rgba(255,255,255,0.35)',
  faint:  'rgba(255,255,255,0.15)',
  border: 'rgba(255,255,255,0.08)',
  card:   '#161618',
  card2:  '#1c1c1f',
}

interface Task {
  id: string
  title: string
  urgency: string
  xp_value: number
  mission_roi: number
  due_date?: string | null
  status: string
}

interface CalDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

function roiColor(roi: number) {
  if (roi >= 5) return G.gold
  if (roi >= 4) return G.green
  if (roi >= 3) return G.blue
  return G.muted
}

const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear]       = useState(() => new Date().getFullYear())
  const [month, setMonth]     = useState(() => new Date().getMonth())
  const [selected, setSelected] = useState<CalDay | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDue, setNewDue]     = useState('')
  const [addingOn, setAddingOn] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await fetch('/api/tasks').then(r => r.ok ? r.json() : [])
    setTasks(data); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  // Build calendar grid (Mon-start)
  const grid: CalDay[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
  const today    = new Date().toISOString().split('T')[0]

  // Prev month padding
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    grid.push({ date: d, isCurrentMonth: false, isToday: false, tasks: [] })
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]
    const dayTasks = tasks.filter(t => t.due_date === dateStr)
    grid.push({ date, isCurrentMonth: true, isToday: dateStr === today, tasks: dayTasks })
  }
  // Next month padding
  const remaining = 42 - grid.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    grid.push({ date: d, isCurrentMonth: false, isToday: false, tasks: [] })
  }

  // Tasks with no due date
  const unscheduled = tasks.filter(t => !t.due_date)
  // Overdue tasks
  const overdue = tasks.filter(t => t.due_date && t.due_date < today)

  async function setDue(id: string, due_date: string) {
    await fetch('/api/tasks', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, due_date: due_date || null }),
    })
    load()
  }

  async function complete(id: string) {
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    load()
    setSelected(s => s ? { ...s, tasks: s.tasks.filter(t => t.id !== id) } : null)
  }

  async function addTask(dueDate: string) {
    if (!newTitle.trim()) return
    await fetch('/api/tasks', {
      method: 'PATCH', // will use a real add endpoint if available, fallback to Telegram
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, due_date: dueDate }),
    })
    setNewTitle(''); setAddingOn(null); load()
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
            <Link href="/" className="hover:opacity-70 transition-opacity">Dashboard</Link>
            <span style={{ color: G.faint }}>/</span>
            <span style={{ color: '#f0f0f0' }}>Calendar</span>
          </div>

          {/* Alert strips */}
          {overdue.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded" style={{ background: `${G.red}10`, border: `1px solid ${G.red}30` }}>
              <span style={{ color: G.red, fontSize: '0.7rem', fontWeight: 600 }}>⚠ {overdue.length} overdue task{overdue.length > 1 ? 's' : ''}:</span>
              {overdue.map(t => (
                <span key={t.id} className="text-xs px-2 py-0.5 rounded"
                  style={{ background: `${G.red}18`, color: G.red }}>
                  {t.title} · {t.due_date}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">

            {/* Calendar */}
            <div className="flex flex-col gap-3">
              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="px-3 py-1.5 rounded text-sm transition-colors hover:bg-white/5"
                  style={{ color: G.muted }}>← prev</button>
                <h2 className="text-base font-semibold" style={{ color: '#f0f0f0' }}>
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="px-3 py-1.5 rounded text-sm transition-colors hover:bg-white/5"
                  style={{ color: G.muted }}>next →</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center" style={{ color: G.faint, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-px rounded overflow-hidden" style={{ background: G.border }}>
                {grid.map((day, i) => {
                  const dateStr = day.date.toISOString().split('T')[0]
                  const isSelected = selected?.date.toISOString().split('T')[0] === dateStr
                  return (
                    <button key={i} onClick={() => setSelected(isSelected ? null : day)}
                      className="flex flex-col gap-0.5 p-2 min-h-[72px] text-left transition-colors relative"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.07)' : day.isToday ? 'rgba(26,255,140,0.06)' : G.card,
                        opacity: day.isCurrentMonth ? 1 : 0.3,
                      }}>
                      <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                        style={{
                          color: day.isToday ? '#000' : day.isCurrentMonth ? '#e0e0e0' : G.faint,
                          background: day.isToday ? G.green : 'transparent',
                          fontSize: '0.72rem',
                        }}>
                        {day.date.getDate()}
                      </span>
                      {/* Task dots / pills */}
                      <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                        {day.tasks.slice(0, 3).map(t => (
                          <div key={t.id} className="text-[10px] px-1 py-0.5 rounded truncate leading-tight"
                            style={{ background: `${roiColor(t.mission_roi)}18`, color: roiColor(t.mission_roi) }}>
                            {t.title}
                          </div>
                        ))}
                        {day.tasks.length > 3 && (
                          <span style={{ color: G.muted, fontSize: '0.6rem' }}>+{day.tasks.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Side panel */}
            <div className="flex flex-col gap-3">

              {/* Selected day detail */}
              {selected ? (
                <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <div>
                      <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {selected.date.toLocaleDateString('en-GB', { weekday: 'long' })}
                      </p>
                      <p className="text-base font-bold" style={{ color: '#f0f0f0' }}>
                        {selected.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <span className="text-xl font-black font-mono" style={{ color: G.blue }}>{selected.tasks.length}</span>
                  </div>

                  {selected.tasks.length === 0 ? (
                    <p className="px-4 py-3 text-xs" style={{ color: G.muted }}>No tasks this day.</p>
                  ) : (
                    <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
                      {selected.tasks.map(t => (
                        <div key={t.id} className="px-4 py-3 flex items-start gap-3">
                          <button onClick={() => complete(t.id)}
                            className="w-4 h-4 rounded border shrink-0 mt-0.5 transition-colors hover:border-green-400"
                            style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm" style={{ color: '#e0e0e0' }}>{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1 py-0.5 rounded"
                                style={{ background: `${roiColor(t.mission_roi)}18`, color: roiColor(t.mission_roi) }}>
                                ROI {t.mission_roi}
                              </span>
                              <span style={{ color: G.blue, fontSize: '0.65rem', fontFamily: 'var(--font-geist-mono)' }}>+{t.xp_value} XP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reschedule tasks to this day */}
                  {unscheduled.length > 0 && (
                    <div style={{ borderTop: `1px solid ${G.border}` }}>
                      <p className="px-4 py-2" style={{ color: G.faint, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Schedule a task here
                      </p>
                      <div className="flex flex-col max-h-40 overflow-y-auto">
                        {unscheduled.slice(0, 8).map(t => (
                          <button key={t.id} onClick={() => setDue(t.id, selected.date.toISOString().split('T')[0])}
                            className="px-4 py-2 text-left text-xs transition-colors hover:bg-white/5 flex items-center gap-2"
                            style={{ color: G.muted }}>
                            <span style={{ color: roiColor(t.mission_roi) }}>+</span>
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded p-4 text-center" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <p className="text-sm" style={{ color: G.muted }}>Click a day to see tasks</p>
                </div>
              )}

              {/* Unscheduled tasks */}
              <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: G.faint, fontSize: '0.58rem' }}>// </span>
                    <span style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unscheduled</span>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: unscheduled.length > 0 ? G.gold : G.faint }}>{unscheduled.length}</span>
                </div>
                {loading ? (
                  <div className="p-4 flex flex-col gap-2">
                    {[1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
                  </div>
                ) : unscheduled.length === 0 ? (
                  <p className="px-4 py-3 text-xs" style={{ color: G.muted }}>All tasks scheduled.</p>
                ) : (
                  <div className="flex flex-col divide-y max-h-72 overflow-y-auto" style={{ borderColor: G.border }}>
                    {unscheduled.map(t => (
                      <div key={t.id} className="px-4 py-2.5 flex items-center gap-2 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ color: '#e0e0e0' }}>{t.title}</p>
                          <span className="text-[10px]" style={{ color: roiColor(t.mission_roi) }}>ROI {t.mission_roi}</span>
                        </div>
                        <input type="date" className="text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0', width: 110 }}
                          onChange={e => e.target.value && setDue(t.id, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* This week summary */}
              <ThisWeek tasks={tasks} today={today} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function ThisWeek({ tasks, today }: { tasks: Task[]; today: string }) {
  const start = new Date(today)
  const dow   = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dow)
  const end = new Date(start); end.setDate(start.getDate() + 6)

  const weekTasks = tasks.filter(t => {
    if (!t.due_date) return false
    return t.due_date >= start.toISOString().split('T')[0] && t.due_date <= end.toISOString().split('T')[0]
  })

  return (
    <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: G.faint, fontSize: '0.58rem' }}>//</span>
            <span style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>This Week</span>
          </div>
          <span className="text-xs font-mono font-bold" style={{ color: G.blue }}>{weekTasks.length} tasks</span>
        </div>
      </div>
      {weekTasks.length === 0 ? (
        <p className="px-4 py-3 text-xs" style={{ color: G.muted }}>Nothing scheduled this week.</p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
          {weekTasks.sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? '')).map(t => (
            <div key={t.id} className="px-4 py-2.5 flex items-center gap-2">
              <span className="text-[10px] font-mono w-12 shrink-0"
                style={{ color: t.due_date === today ? G.gold : G.muted }}>
                {t.due_date === today ? 'TODAY' : new Date(t.due_date!).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
              </span>
              <span className="flex-1 text-xs truncate" style={{ color: '#e0e0e0' }}>{t.title}</span>
              <span className="text-[10px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: roiColor(t.mission_roi) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
