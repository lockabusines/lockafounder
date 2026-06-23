'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

// ── Design tokens ─────────────────────────────────────────────────────────
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

const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const URGENCIES = ['low','medium','high','critical']
const CATEGORIES = ['general','health','business','wealth','discipline','charisma']

interface Task {
  id: string
  title: string
  urgency: string
  xp_value: number
  category: string
  mission_roi: number
  due_date?: string | null
  status: string
}

interface NewTaskForm {
  title: string
  urgency: string
  category: string
  mission_roi: number
  due_date: string
}

function roiColor(roi: number) {
  if (roi >= 5) return G.gold
  if (roi >= 4) return G.green
  if (roi >= 3) return G.blue
  return G.muted
}

function urgencyColor(u: string) {
  if (u === 'critical') return G.red
  if (u === 'high')     return G.gold
  if (u === 'medium')   return G.blue
  return G.muted
}

const emptyForm = (date = ''): NewTaskForm => ({
  title: '', urgency: 'medium', category: 'general', mission_roi: 3, due_date: date,
})

// ── Page ──────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
  const [year, setYear]         = useState(() => new Date().getFullYear())
  const [month, setMonth]       = useState(() => new Date().getMonth())

  // Panel state
  const [panel, setPanel] = useState<
    | { type: 'day';  date: string }
    | { type: 'task'; task: Task }
    | null
  >(null)

  // Add task form
  const [addForm, setAddForm]   = useState<NewTaskForm | null>(null)
  const [saving, setSaving]     = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    const data = await fetch('/api/tasks').then(r => r.ok ? r.json() : [])
    setTasks(data); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Focus title when form opens
  useEffect(() => {
    if (addForm) setTimeout(() => titleRef.current?.focus(), 50)
  }, [addForm])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setPanel(null); setAddForm(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setPanel(null); setAddForm(null)
  }
  function goToday() {
    const n = new Date()
    setYear(n.getFullYear()); setMonth(n.getMonth())
    setPanel({ type: 'day', date: today })
    setAddForm(null)
  }

  // Build grid
  const firstDay  = new Date(year, month, 1)
  const lastDay   = new Date(year, month + 1, 0)
  const startDow  = (firstDay.getDay() + 6) % 7

  type GridDay = { date: Date; dateStr: string; inMonth: boolean; isToday: boolean; tasks: Task[] }
  const grid: GridDay[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    grid.push({ date: d, dateStr: d.toISOString().split('T')[0], inMonth: false, isToday: false, tasks: [] })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split('T')[0]
    grid.push({ date, dateStr, inMonth: true, isToday: dateStr === today, tasks: tasks.filter(t => t.due_date === dateStr) })
  }
  const rem = 42 - grid.length
  for (let i = 1; i <= rem; i++) {
    const d = new Date(year, month + 1, i)
    grid.push({ date: d, dateStr: d.toISOString().split('T')[0], inMonth: false, isToday: false, tasks: [] })
  }

  const overdue     = tasks.filter(t => t.due_date && t.due_date < today)
  const unscheduled = tasks.filter(t => !t.due_date)

  async function addTask() {
    if (!addForm?.title.trim()) return
    setSaving(true)
    const res = await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    if (res.ok) {
      const created = await res.json()
      setTasks(prev => [...prev, created])
      setAddForm(null)
      // Switch panel to show the day
      setPanel({ type: 'day', date: addForm.due_date })
    }
    setSaving(false)
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    setTasks(t => t.filter(x => x.id !== id))
    if (panel?.type === 'task') setPanel(null)
  }

  async function setDue(id: string, due_date: string) {
    const res = await fetch('/api/tasks', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, due_date: due_date || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks(t => t.map(x => x.id === id ? updated : x))
      if (panel?.type === 'task') setPanel({ type: 'task', task: updated })
    }
  }

  // Derived panel data
  const panelDayTasks = panel?.type === 'day' ? tasks.filter(t => t.due_date === panel.date) : []
  const panelDate     = panel?.type === 'day' ? new Date(panel.date + 'T12:00:00') : null

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 h-full">

          {/* Breadcrumb + nav */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
              <Link href="/" className="hover:opacity-70">Dashboard</Link>
              <span style={{ color: G.faint }}>/</span>
              <span style={{ color: '#f0f0f0' }}>Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="px-3 py-1.5 rounded text-xs font-semibold transition-colors hover:bg-white/5"
                style={{ color: G.muted, border: `1px solid ${G.border}` }}>Today</button>
              <button onClick={prevMonth} className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors hover:bg-white/5"
                style={{ color: G.muted }}>‹</button>
              <span className="text-sm font-semibold w-36 text-center" style={{ color: '#f0f0f0' }}>
                {MONTHS[month]} {year}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors hover:bg-white/5"
                style={{ color: G.muted }}>›</button>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: G.muted }}>
              {overdue.length > 0 && <span style={{ color: G.red }}>⚠ {overdue.length} overdue</span>}
              {unscheduled.length > 0 && <span>{unscheduled.length} unscheduled</span>}
              <span>{tasks.length} total tasks</span>
            </div>
          </div>

          {/* Main layout */}
          <div className="flex gap-3 flex-1 min-h-0">

            {/* Calendar grid */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="py-1.5 text-center"
                    style={{ color: G.faint, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-px flex-1 rounded overflow-hidden" style={{ background: G.border }}>
                {grid.map((day, i) => {
                  const isSelected = panel?.type === 'day' && panel.date === day.dateStr
                  const isAddingHere = addForm?.due_date === day.dateStr
                  return (
                    <div key={i}
                      className="flex flex-col group cursor-pointer transition-colors relative"
                      style={{
                        background: isSelected || isAddingHere
                          ? 'rgba(255,255,255,0.07)'
                          : day.isToday
                          ? 'rgba(26,255,140,0.05)'
                          : G.card,
                        opacity: day.inMonth ? 1 : 0.3,
                        minHeight: 80,
                      }}
                      onClick={() => {
                        if (!day.inMonth) return
                        setPanel({ type: 'day', date: day.dateStr })
                        setAddForm(null)
                      }}
                    >
                      {/* Date number */}
                      <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
                        <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                          style={{
                            color: day.isToday ? '#000' : '#d0d0d0',
                            background: day.isToday ? G.green : 'transparent',
                            fontSize: '0.72rem',
                          }}>
                          {day.date.getDate()}
                        </span>
                        {/* + button on hover */}
                        {day.inMonth && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setAddForm(emptyForm(day.dateStr))
                              setPanel({ type: 'day', date: day.dateStr })
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            style={{ color: G.muted, background: 'rgba(255,255,255,0.06)' }}>
                            +
                          </button>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className="flex flex-col gap-0.5 px-1 pb-1 overflow-hidden">
                        {day.tasks.slice(0, 4).map(t => (
                          <button key={t.id}
                            onClick={e => { e.stopPropagation(); setPanel({ type: 'task', task: t }); setAddForm(null) }}
                            className="text-left text-[11px] px-1.5 py-0.5 rounded truncate leading-tight w-full transition-opacity hover:opacity-80"
                            style={{ background: `${roiColor(t.mission_roi)}20`, color: roiColor(t.mission_roi) }}>
                            {t.title}
                          </button>
                        ))}
                        {day.tasks.length > 4 && (
                          <span style={{ color: G.muted, fontSize: '0.6rem', paddingLeft: 6 }}>+{day.tasks.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right panel */}
            <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">

              {/* Add task form */}
              {addForm && (
                <div className="rounded overflow-hidden" style={{ background: G.card2, border: `1px solid ${G.green}33` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <div>
                      <p style={{ color: G.green, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Task</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: '#f0f0f0' }}>
                        {new Date(addForm.due_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <button onClick={() => setAddForm(null)} style={{ color: G.muted, fontSize: '1rem' }}>×</button>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <input ref={titleRef}
                      placeholder="Task title…"
                      value={addForm.title}
                      onChange={e => setAddForm(f => f ? { ...f, title: e.target.value } : f)}
                      onKeyDown={e => e.key === 'Enter' && addTask()}
                      className="w-full px-3 py-2 rounded text-sm"
                      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, color: '#f0f0f0' }}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Urgency</label>
                        <select value={addForm.urgency} onChange={e => setAddForm(f => f ? { ...f, urgency: e.target.value } : f)}
                          className="px-2 py-1.5 rounded text-xs capitalize">
                          {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
                        <select value={addForm.category} onChange={e => setAddForm(f => f ? { ...f, category: e.target.value } : f)}
                          className="px-2 py-1.5 rounded text-xs capitalize">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mission ROI (1–5)</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setAddForm(f => f ? { ...f, mission_roi: n } : f)}
                            className="flex-1 py-1.5 rounded text-xs font-bold transition-colors"
                            style={{
                              background: addForm.mission_roi === n ? `${roiColor(n)}30` : 'rgba(255,255,255,0.04)',
                              color: addForm.mission_roi === n ? roiColor(n) : G.muted,
                              border: `1px solid ${addForm.mission_roi === n ? roiColor(n) + '50' : 'transparent'}`,
                            }}>
                            {n}
                          </button>
                        ))}
                      </div>
                      <p style={{ color: G.faint, fontSize: '0.6rem' }}>
                        {addForm.mission_roi >= 5 ? '💰 Direct money move' : addForm.mission_roi >= 4 ? '📈 High ROI' : addForm.mission_roi >= 3 ? '🔧 Medium ROI' : '📋 Low priority'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</label>
                      <input type="date" value={addForm.due_date}
                        onChange={e => setAddForm(f => f ? { ...f, due_date: e.target.value } : f)}
                        className="px-2 py-1.5 rounded text-xs" />
                    </div>

                    <button onClick={addTask} disabled={saving || !addForm.title.trim()}
                      className="w-full py-2.5 rounded text-sm font-bold transition-opacity"
                      style={{
                        background: G.green, color: '#000',
                        opacity: (!addForm.title.trim() || saving) ? 0.4 : 1,
                      }}>
                      {saving ? 'Adding…' : 'Add Task'}
                    </button>
                  </div>
                </div>
              )}

              {/* Day panel */}
              {panel?.type === 'day' && !addForm && (
                <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <div>
                      <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {panelDate?.toLocaleDateString('en-GB', { weekday: 'long' })}
                      </p>
                      <p className="text-base font-semibold" style={{ color: '#f0f0f0' }}>
                        {panelDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <button
                      onClick={() => setAddForm(emptyForm(panel.date))}
                      className="px-3 py-1.5 rounded text-xs font-bold"
                      style={{ background: `${G.green}18`, color: G.green, border: `1px solid ${G.green}33` }}>
                      + Add
                    </button>
                  </div>

                  {panelDayTasks.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm" style={{ color: G.muted }}>Nothing scheduled.</p>
                      <button onClick={() => setAddForm(emptyForm(panel.date))}
                        className="mt-2 text-xs underline" style={{ color: G.green }}>
                        Add a task
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
                      {panelDayTasks.map(t => (
                        <div key={t.id} className="px-4 py-3 flex items-start gap-3">
                          <button onClick={() => deleteTask(t.id)}
                            className="w-4 h-4 rounded border shrink-0 mt-0.5 transition-colors hover:border-green-400 hover:bg-green-400/10"
                            style={{ borderColor: 'rgba(255,255,255,0.2)' }} title="Mark complete" />
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPanel({ type: 'task', task: t })}>
                            <p className="text-sm" style={{ color: '#e8e8e8' }}>{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] px-1 py-0.5 rounded capitalize"
                                style={{ background: `${urgencyColor(t.urgency)}15`, color: urgencyColor(t.urgency) }}>
                                {t.urgency}
                              </span>
                              <span className="text-[10px]" style={{ color: G.blue, fontFamily: 'var(--font-geist-mono)' }}>+{t.xp_value}xp</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Task detail panel */}
              {panel?.type === 'task' && (
                <TaskDetailPanel
                  task={panel.task}
                  onClose={() => setPanel(null)}
                  onComplete={() => deleteTask(panel.task.id)}
                  onSetDue={(date) => setDue(panel.task.id, date)}
                />
              )}

              {/* Unscheduled */}
              {!addForm && (
                <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <span style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unscheduled</span>
                    <span className="font-mono text-xs font-bold" style={{ color: unscheduled.length > 0 ? G.gold : G.faint }}>
                      {unscheduled.length}
                    </span>
                  </div>
                  {unscheduled.length === 0 ? (
                    <p className="px-4 py-3 text-xs" style={{ color: G.faint }}>All tasks have dates.</p>
                  ) : (
                    <div className="flex flex-col divide-y max-h-60 overflow-y-auto" style={{ borderColor: G.border }}>
                      {unscheduled.map(t => (
                        <div key={t.id} className="px-4 py-2.5 flex items-center gap-2 group">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: roiColor(t.mission_roi) }} />
                          <span className="flex-1 text-xs truncate" style={{ color: '#d8d8d8' }}>{t.title}</span>
                          <input type="date"
                            className="text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0', width: 108 }}
                            onChange={e => e.target.value && setDue(t.id, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick add button when no panel */}
              {!panel && !addForm && (
                <button
                  onClick={() => setAddForm(emptyForm(today))}
                  className="w-full py-3 rounded text-sm font-semibold transition-colors hover:opacity-90"
                  style={{ background: `${G.green}18`, color: G.green, border: `1px solid ${G.green}33` }}>
                  + Add task for today
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Task detail panel ──────────────────────────────────────────────────────
function TaskDetailPanel({ task, onClose, onComplete, onSetDue }: {
  task: Task
  onClose: () => void
  onComplete: () => void
  onSetDue: (date: string) => void
}) {
  return (
    <div className="rounded overflow-hidden" style={{ background: G.card2, border: `1px solid ${roiColor(task.mission_roi)}33` }}>
      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ borderBottom: `1px solid ${G.border}` }}>
        <p className="text-sm font-semibold flex-1" style={{ color: '#f0f0f0' }}>{task.title}</p>
        <button onClick={onClose} style={{ color: G.muted, fontSize: '1rem', lineHeight: 1 }}>×</button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Urgency</p>
            <p className="text-sm font-semibold capitalize mt-0.5" style={{ color: urgencyColor(task.urgency) }}>{task.urgency}</p>
          </div>
          <div>
            <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</p>
            <p className="text-sm font-semibold capitalize mt-0.5" style={{ color: '#e0e0e0' }}>{task.category}</p>
          </div>
          <div>
            <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mission ROI</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: roiColor(task.mission_roi) }}>{task.mission_roi} / 5</p>
          </div>
          <div>
            <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP</p>
            <p className="text-sm font-mono font-bold mt-0.5" style={{ color: G.blue }}>+{task.xp_value}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Due date</label>
          <input type="date" defaultValue={task.due_date ?? ''}
            onChange={e => onSetDue(e.target.value)}
            className="px-3 py-2 rounded text-sm" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onComplete}
            className="flex-1 py-2 rounded text-xs font-bold"
            style={{ background: `${G.green}18`, color: G.green, border: `1px solid ${G.green}33` }}>
            ✓ Mark complete
          </button>
        </div>
      </div>
    </div>
  )
}
