'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

const CATEGORIES = [
  { key: 'food',          label: 'Food & Drink',    icon: '🍔', color: G.gold   },
  { key: 'transport',     label: 'Transport',        icon: '🚗', color: G.blue   },
  { key: 'bills',         label: 'Bills',            icon: '📱', color: G.purple },
  { key: 'shopping',      label: 'Shopping',         icon: '🛍️', color: G.blue   },
  { key: 'entertainment', label: 'Entertainment',    icon: '🎮', color: G.purple },
  { key: 'health',        label: 'Health',           icon: '💊', color: G.green  },
  { key: 'investment',    label: 'Investment',       icon: '📈', color: G.green  },
  { key: 'general',       label: 'General',          icon: '💸', color: G.muted  },
]

function catInfo(key: string) {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]
}

interface Expense {
  id: string
  amount: number
  category: string
  description?: string
  date: string
  created_at: string
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function groupByDate(expenses: Expense[]) {
  const map = new Map<string, Expense[]>()
  for (const e of expenses) {
    const list = map.get(e.date) ?? []
    list.push(e)
    map.set(e.date, list)
  }
  return map
}

export default function ExpensesPage() {
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.slice(0, 7)

  const [expenses, setExpenses]   = useState<Expense[]>([])
  const [loading, setLoading]     = useState(true)
  const [month, setMonth]         = useState(currentMonth)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Quick-add form
  const [form, setForm] = useState({ amount: '', category: 'food', description: '', date: today })
  const amountRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch(`/api/expenses?month=${month}`).then(r => r.ok ? r.json() : [])
    setExpenses(data); setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  // Focus amount on mount
  useEffect(() => { amountRef.current?.focus() }, [])

  async function addExpense() {
    if (!form.amount || isNaN(Number(form.amount))) return
    setSaving(true)
    const res = await fetch('/api/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    })
    if (res.ok) {
      const created = await res.json()
      setExpenses(prev => [created, ...prev])
      setForm(f => ({ ...f, amount: '', description: '' }))
      amountRef.current?.focus()
    }
    setSaving(false)
  }

  async function deleteExpense(id: string) {
    setDeletingId(id)
    await fetch('/api/expenses', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setExpenses(prev => prev.filter(e => e.id !== id))
    setDeletingId(null)
  }

  function prevMonth() {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  function nextMonth() {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Stats
  const total          = expenses.reduce((s, e) => s + e.amount, 0)
  const todayTotal     = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0)
  const byCategory     = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.key).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const grouped   = groupByDate(expenses)
  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  const isCurrentMonth = month === currentMonth

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
            <Link href="/" className="hover:opacity-70">Dashboard</Link>
            <span style={{ color: G.faint }}>/</span>
            <span style={{ color: '#f0f0f0' }}>Expenses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">

            {/* Left — log + history */}
            <div className="flex flex-col gap-4">

              {/* Quick-add */}
              <div className="rounded overflow-hidden" style={{ background: G.card2, border: `1px solid ${G.green}33` }}>
                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: G.faint, fontSize: '0.58rem' }}>LOG //</span>
                    <span style={{ color: G.green, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {form.date === today ? "Today's spend" : form.date}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  {/* Amount — large, front and centre */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{ color: G.red }}>£</span>
                    <input
                      ref={amountRef}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addExpense()}
                      className="flex-1 text-3xl font-black rounded px-3 py-2"
                      style={{ background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, color: '#f0f0f0', fontFamily: 'var(--font-geist-mono)' }}
                    />
                  </div>

                  {/* Category grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {CATEGORIES.map(c => (
                      <button key={c.key} onClick={() => setForm(f => ({ ...f, category: c.key }))}
                        className="flex flex-col items-center gap-1 py-2 px-1 rounded transition-colors"
                        style={{
                          background: form.category === c.key ? `${c.color}20` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${form.category === c.key ? c.color + '50' : 'transparent'}`,
                        }}>
                        <span className="text-base leading-none">{c.icon}</span>
                        <span style={{ color: form.category === c.key ? c.color : G.faint, fontSize: '0.58rem', textAlign: 'center', lineHeight: 1.2 }}>{c.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Description + date row */}
                  <div className="flex gap-2">
                    <input
                      placeholder="Description (optional)"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addExpense()}
                      className="flex-1 px-3 py-2 rounded text-sm"
                    />
                    <input type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="px-2 py-2 rounded text-xs" style={{ width: 130 }} />
                  </div>

                  <button onClick={addExpense} disabled={saving || !form.amount}
                    className="w-full py-3 rounded text-sm font-bold transition-opacity"
                    style={{ background: G.red, color: '#fff', opacity: (!form.amount || saving) ? 0.4 : 1 }}>
                    {saving ? 'Logging…' : `Log £${form.amount || '0'} · ${catInfo(form.category).label}`}
                  </button>
                </div>
              </div>

              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/5" style={{ color: G.muted }}>← prev</button>
                <span className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>{fmtMonth(month)}</span>
                <button onClick={nextMonth} disabled={isCurrentMonth} className="px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/5"
                  style={{ color: isCurrentMonth ? G.faint : G.muted, opacity: isCurrentMonth ? 0.4 : 1 }}>next →</button>
              </div>

              {/* Daily groups */}
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[1,2,3].map(i => <div key={i} className="h-16 rounded animate-pulse" style={{ background: G.card }} />)}
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="rounded p-8 text-center" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <p style={{ color: G.muted }}>No expenses logged for {fmtMonth(month)}.</p>
                  {isCurrentMonth && <p className="text-xs mt-1" style={{ color: G.faint }}>Use the form above to log today's spend.</p>}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sortedDates.map(date => {
                    const dayExpenses = grouped.get(date)!
                    const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0)
                    const isToday = date === today
                    return (
                      <div key={date} className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                        {/* Day header */}
                        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}`, background: isToday ? `${G.red}08` : 'transparent' }}>
                          <div className="flex items-center gap-2">
                            {isToday && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${G.red}20`, color: G.red }}>TODAY</span>}
                            <span className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                              {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <span className="text-sm font-black font-mono" style={{ color: G.red }}>£{dayTotal.toFixed(2)}</span>
                        </div>

                        {/* Entries */}
                        <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
                          {dayExpenses.map(e => {
                            const cat = catInfo(e.category)
                            return (
                              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 group">
                                <span className="text-lg shrink-0">{cat.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm" style={{ color: '#e0e0e0' }}>{e.description || cat.label}</p>
                                  <p style={{ color: G.faint, fontSize: '0.65rem' }}>{cat.label}</p>
                                </div>
                                <span className="text-sm font-bold font-mono" style={{ color: G.red }}>£{e.amount.toFixed(2)}</span>
                                <button
                                  onClick={() => deleteExpense(e.id)}
                                  disabled={deletingId === e.id}
                                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded"
                                  style={{ color: G.muted, background: 'rgba(255,255,255,0.05)' }}>
                                  ✕
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right — stats */}
            <div className="flex flex-col gap-3">

              {/* Today vs month */}
              <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <p style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Summary</p>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
                  {[
                    { label: "Today's spend",   value: todayTotal,  color: G.red  },
                    { label: `${fmtMonth(month)} total`, value: total, color: G.red  },
                    { label: 'Daily average',    value: sortedDates.length ? total / sortedDates.length : 0, color: G.muted },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="px-4 py-3 flex items-center justify-between">
                      <span style={{ color: G.muted, fontSize: '0.75rem' }}>{label}</span>
                      <span className="text-lg font-black font-mono" style={{ color }}>£{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By category */}
              <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
                  <p style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>By Category</p>
                </div>
                {byCategory.length === 0 ? (
                  <p className="px-4 py-3 text-xs" style={{ color: G.faint }}>No data yet.</p>
                ) : byCategory.map(c => {
                  const pct = total > 0 ? (c.total / total) * 100 : 0
                  return (
                    <div key={c.key} className="px-4 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{c.icon}</span>
                          <span className="text-xs" style={{ color: '#d8d8d8' }}>{c.label}</span>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{ color: c.color }}>£{c.total.toFixed(2)}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                      <p className="text-right mt-0.5" style={{ color: G.faint, fontSize: '0.6rem' }}>{pct.toFixed(0)}%</p>
                    </div>
                  )
                })}
              </div>

              {/* Top entries this month */}
              {expenses.length > 0 && (
                <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
                    <p style={{ color: G.muted, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Biggest Spends</p>
                  </div>
                  {[...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5).map(e => {
                    const cat = catInfo(e.category)
                    return (
                      <div key={e.id} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                        <span className="text-base">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ color: '#d8d8d8' }}>{e.description || cat.label}</p>
                          <p style={{ color: G.faint, fontSize: '0.62rem' }}>{new Date(e.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{ color: G.red }}>£{e.amount.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
