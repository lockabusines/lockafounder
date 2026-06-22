'use client'

import { useEffect, useState } from 'react'

const GOLD  = 'oklch(0.78 0.18 80)'
const GREEN = 'oklch(0.68 0.18 145)'
const BLUE  = 'oklch(0.65 0.20 250)'
const MUTED = 'oklch(0.40 0.008 264)'
const DIM   = 'oklch(0.22 0.015 264)'

interface Stream {
  id: string; name: string; type: string; skill: string
  monthly_amount: number; notes?: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  passive:  { label: 'PASSIVE',  color: GREEN },
  active:   { label: 'ACTIVE',   color: BLUE  },
  building: { label: 'BUILDING', color: GOLD  },
}

const SKILLS = ['job', 'solar', 'electrical', 'renovations', 'training', 'ai', 'other']

export function IncomeStreams() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'active', skill: 'other', monthly_amount: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch('/api/income-streams')
    if (r.ok) setStreams(await r.json())
    setLoading(false)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const r = await fetch('/api/income-streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, monthly_amount: Number(form.monthly_amount) || 0 }),
    })
    if (r.ok) {
      const s = await r.json()
      setStreams(prev => [...prev, s])
      setForm({ name: '', type: 'active', skill: 'other', monthly_amount: '' })
      setAdding(false)
    }
    setSaving(false)
  }

  async function updateAmount(id: string, amount: number) {
    await fetch('/api/income-streams', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, monthly_amount: amount }),
    })
    setStreams(prev => prev.map(s => s.id === id ? { ...s, monthly_amount: amount } : s))
  }

  const passive = streams.filter(s => s.type === 'passive').reduce((sum, s) => sum + s.monthly_amount, 0)
  const active  = streams.filter(s => s.type === 'active').reduce((sum, s) => sum + s.monthly_amount, 0)
  const total   = passive + active

  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ border: `1px solid ${GREEN}33` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}>
        <div>
          <p className="text-sm font-bold tracking-wider uppercase" style={{ color: GREEN }}>Income Streams</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>All money coming in this month</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: `${GREEN}22`, color: GREEN, border: `1px solid ${GREEN}44` }}
        >
          + Add
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-px" style={{ background: 'oklch(0.20 0.015 264)' }}>
        {[
          { label: 'Total monthly', value: `£${total.toLocaleString()}`, color: 'white' },
          { label: 'Passive', value: `£${passive.toLocaleString()}`, color: GREEN },
          { label: 'Active (time)', value: `£${active.toLocaleString()}`, color: BLUE },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5 px-4 py-3" style={{ background: 'oklch(0.11 0.015 264)' }}>
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: MUTED }}>{label}</p>
            <p className="text-lg font-black font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div className="flex flex-col gap-3 p-4" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)`, background: 'oklch(0.13 0.015 264)' }}>
          <input
            placeholder="Stream name (e.g. Solar job, YouTube, Rent)"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}
            >
              <option value="active">Active</option>
              <option value="passive">Passive</option>
              <option value="building">Building</option>
            </select>
            <select
              value={form.skill}
              onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}
            >
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              placeholder="£/mo"
              type="number"
              value={form.monthly_amount}
              onChange={e => setForm(f => ({ ...f, monthly_amount: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: GREEN, color: 'black' }}
            >
              {saving ? 'Saving...' : 'Save Stream'}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-lg text-xs"
              style={{ background: DIM, color: MUTED }}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* Stream list */}
      {loading ? (
        <div className="p-4 flex flex-col gap-2">
          {[1,2].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />)}
        </div>
      ) : streams.length === 0 ? (
        <p className="p-5 text-sm text-center" style={{ color: MUTED }}>No streams yet. Add your 9-5 salary to start.</p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: 'oklch(0.17 0.012 264)' }}>
          {streams.map(stream => {
            const cfg = TYPE_CONFIG[stream.type] ?? TYPE_CONFIG.active
            return (
              <div key={stream.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${cfg.color}20`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="flex-1 text-sm" style={{ color: 'oklch(0.85 0.008 264)' }}>{stream.name}</span>
                <span className="text-xs font-mono shrink-0" style={{ color: MUTED }}>{stream.skill}</span>
                <EditableAmount
                  value={stream.monthly_amount}
                  onChange={v => updateAmount(stream.id, v)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EditableAmount({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const GOLD = 'oklch(0.78 0.18 80)'

  if (editing) return (
    <input
      autoFocus
      type="number"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => { onChange(Number(draft) || 0); setEditing(false) }}
      onKeyDown={e => { if (e.key === 'Enter') { onChange(Number(draft) || 0); setEditing(false) } }}
      className="w-20 px-2 py-0.5 rounded text-xs font-mono text-right"
      style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid ${GOLD}`, color: 'white' }}
    />
  )

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true) }}
      className="text-sm font-black font-mono shrink-0 transition-all hover:opacity-70"
      style={{ color: GOLD }}
    >
      £{value.toLocaleString()}
    </button>
  )
}
