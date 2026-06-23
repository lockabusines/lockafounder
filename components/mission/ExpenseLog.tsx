'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const G = {
  green:  '#1aff8c',
  red:    '#ff4455',
  gold:   '#f5c842',
  blue:   '#4db8ff',
  muted:  'rgba(255,255,255,0.35)',
  faint:  'rgba(255,255,255,0.15)',
  border: 'rgba(255,255,255,0.08)',
}

const CATEGORIES = [
  { key: 'food',          label: 'Food',        icon: '🍔', color: G.gold   },
  { key: 'transport',     label: 'Transport',   icon: '🚗', color: G.blue   },
  { key: 'bills',         label: 'Bills',       icon: '📱', color: '#a78bfa'},
  { key: 'shopping',      label: 'Shopping',    icon: '🛍️', color: G.blue   },
  { key: 'entertainment', label: 'Fun',         icon: '🎮', color: '#a78bfa'},
  { key: 'health',        label: 'Health',      icon: '💊', color: G.green  },
  { key: 'investment',    label: 'Invest',      icon: '📈', color: G.green  },
  { key: 'general',       label: 'Other',       icon: '💸', color: G.muted  },
]

function catInfo(key: string) {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]
}

interface Expense {
  id: string; amount: number; category: string; description?: string; date: string
}

export function ExpenseLog() {
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.slice(0, 7)

  const [expenses, setExpenses]   = useState<Expense[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [showAll, setShowAll]     = useState(false)
  const [form, setForm]           = useState({ amount: '', category: 'food', description: '', date: today })
  const amountRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const data = await fetch(`/api/expenses?month=${currentMonth}`).then(r => r.ok ? r.json() : [])
    setExpenses(data); setLoading(false)
  }, [currentMonth])

  useEffect(() => { load() }, [load])

  async function add() {
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

  async function del(id: string) {
    await fetch('/api/expenses', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const todayTotal  = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0)
  const monthTotal  = expenses.reduce((s, e) => s + e.amount, 0)
  const displayed   = showAll ? expenses : expenses.slice(0, 7)

  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ borderLeft: `2px solid ${G.red}44` }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: G.faint, fontSize: '0.58rem' }}>// </span>
            <span style={{ color: G.red, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Daily Spend Log</span>
          </div>
          <p className="text-sm font-semibold text-white mt-0.5">Log at end of day</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: G.faint }}>Today</p>
          <p className="text-xl font-black font-mono" style={{ color: G.red }}>£{todayTotal.toFixed(2)}</p>
          <p className="text-xs font-mono" style={{ color: G.muted }}>£{monthTotal.toFixed(2)} this month</p>
        </div>
      </div>

      {/* Quick-add form */}
      <div className="px-5 py-4 flex flex-col gap-3" style={{ borderBottom: `1px solid ${G.border}`, background: 'rgba(255,255,255,0.015)' }}>
        {/* Amount */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: G.red }}>£</span>
          <input
            ref={amountRef}
            type="number" step="0.01" min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()}
            className="flex-1 text-2xl font-black px-3 py-1.5 rounded"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f0', fontFamily: 'var(--font-geist-mono)' }}
          />
          <input type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="px-2 py-1.5 rounded text-xs" style={{ width: 120 }} />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setForm(f => ({ ...f, category: c.key }))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors"
              style={{
                background: form.category === c.key ? `${c.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.category === c.key ? c.color + '55' : 'transparent'}`,
                color: form.category === c.key ? c.color : G.muted,
              }}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Description + submit */}
        <div className="flex gap-2">
          <input placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()}
            className="flex-1 px-3 py-2 rounded text-sm" />
          <button onClick={add} disabled={saving || !form.amount}
            className="px-4 py-2 rounded text-sm font-bold transition-opacity"
            style={{ background: G.red, color: '#fff', opacity: (!form.amount || saving) ? 0.4 : 1 }}>
            {saving ? '…' : 'Log'}
          </button>
        </div>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex flex-col gap-2 p-4">
          {[1,2,3].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : expenses.length === 0 ? (
        <p className="px-5 py-4 text-xs" style={{ color: G.muted }}>No spend logged this month yet.</p>
      ) : (
        <>
          <div className="flex flex-col divide-y" style={{ borderColor: G.border }}>
            {displayed.map(e => {
              const cat = catInfo(e.category)
              const isToday = e.date === today
              return (
                <div key={e.id} className="flex items-center gap-3 px-5 py-2.5 group">
                  <span className="text-base shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: '#e0e0e0' }}>{e.description || cat.label}</p>
                    <p style={{ color: G.faint, fontSize: '0.62rem' }}>
                      {isToday ? 'Today' : new Date(e.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' · '}{cat.label}
                    </p>
                  </div>
                  <span className="text-sm font-bold font-mono shrink-0" style={{ color: G.red }}>£{e.amount.toFixed(2)}</span>
                  <button onClick={() => del(e.id)}
                    className="text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ color: G.muted, background: 'rgba(255,255,255,0.05)' }}>✕</button>
                </div>
              )
            })}
          </div>
          {expenses.length > 7 && (
            <button onClick={() => setShowAll(!showAll)}
              className="px-5 py-3 text-xs text-left transition-colors hover:bg-white/5 w-full"
              style={{ color: G.muted, borderTop: `1px solid ${G.border}` }}>
              {showAll ? '↑ Show less' : `↓ Show all ${expenses.length} entries`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
