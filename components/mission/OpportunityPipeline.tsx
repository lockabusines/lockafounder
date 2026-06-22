'use client'

import { useEffect, useState } from 'react'

const GOLD  = 'oklch(0.78 0.18 80)'
const GREEN = 'oklch(0.68 0.18 145)'
const BLUE  = 'oklch(0.65 0.20 250)'
const RED   = 'oklch(0.62 0.22 25)'
const MUTED = 'oklch(0.40 0.008 264)'
const DIM   = 'oklch(0.22 0.015 264)'

interface Opp {
  id: string; name: string; skill: string; status: string
  value?: number; notes?: string; due_date?: string
}

const STATUS = [
  { key: 'lead',       label: 'Lead',       color: BLUE  },
  { key: 'quoted',     label: 'Quoted',     color: GOLD  },
  { key: 'follow_up',  label: 'Follow Up',  color: RED   },
  { key: 'won',        label: 'Won',        color: GREEN },
]

const SKILLS = ['solar', 'electrical', 'renovations', 'training', 'ai', 'other']

export function OpportunityPipeline() {
  const [opps, setOpps] = useState<Opp[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', skill: 'other', status: 'lead', value: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch('/api/opportunities')
    if (r.ok) setOpps(await r.json())
    setLoading(false)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const r = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null }),
    })
    if (r.ok) { setOpps(prev => [await r.json(), ...prev]); setForm({ name: '', skill: 'other', status: 'lead', value: '' }); setAdding(false) }
    setSaving(false)
  }

  async function advance(opp: Opp) {
    const order = STATUS.map(s => s.key)
    const next = order[Math.min(order.indexOf(opp.status) + 1, order.length - 1)]
    await fetch('/api/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: opp.id, status: next }),
    })
    setOpps(prev => prev.map(o => o.id === opp.id ? { ...o, status: next } : o))
  }

  async function lose(id: string) {
    await fetch('/api/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'lost' }),
    })
    setOpps(prev => prev.filter(o => o.id !== id))
  }

  const pipelineValue = opps.reduce((sum, o) => sum + (o.value ?? 0), 0)
  const wonValue = opps.filter(o => o.status === 'won').reduce((sum, o) => sum + (o.value ?? 0), 0)

  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ border: `1px solid ${BLUE}33` }}>

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}>
        <div>
          <p className="text-sm font-bold tracking-wider uppercase" style={{ color: BLUE }}>Opportunity Pipeline</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            {opps.length} active · £{pipelineValue.toLocaleString()} in pipeline · £{wonValue.toLocaleString()} won
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: `${BLUE}22`, color: BLUE, border: `1px solid ${BLUE}44` }}
        >+ Lead</button>
      </div>

      {/* Stage counts */}
      <div className="grid grid-cols-4 gap-px" style={{ background: 'oklch(0.20 0.015 264)' }}>
        {STATUS.map(s => {
          const count = opps.filter(o => o.status === s.key).length
          return (
            <div key={s.key} className="flex flex-col gap-0.5 px-3 py-2.5" style={{ background: 'oklch(0.11 0.015 264)' }}>
              <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: s.color }}>{s.label}</p>
              <p className="text-xl font-black" style={{ color: count > 0 ? s.color : 'oklch(0.28 0.008 264)' }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {adding && (
        <div className="flex flex-col gap-3 p-4" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)`, background: 'oklch(0.13 0.015 264)' }}>
          <input
            placeholder="Client / lead name or description"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}
          />
          <div className="grid grid-cols-3 gap-2">
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs capitalize"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }}>
              {STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <input placeholder="£ value" type="number" value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              className="px-2 py-2 rounded-lg text-xs"
              style={{ background: 'oklch(0.18 0.015 264)', border: `1px solid oklch(0.28 0.015 264)`, color: 'white' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{ background: BLUE, color: 'white' }}>
              {saving ? 'Saving...' : 'Add to Pipeline'}
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-xs"
              style={{ background: DIM, color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Opportunity list */}
      {loading ? (
        <div className="p-4 flex flex-col gap-2">
          {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'oklch(0.18 0.015 264)' }} />)}
        </div>
      ) : opps.length === 0 ? (
        <p className="p-5 text-sm text-center" style={{ color: MUTED }}>No leads yet. Add your first opportunity.</p>
      ) : (
        <div className="flex flex-col divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'oklch(0.17 0.012 264)' }}>
          {opps.map(opp => {
            const s = STATUS.find(x => x.key === opp.status) ?? STATUS[0]
            const isWon = opp.status === 'won'
            return (
              <div key={opp.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${s.color}20`, color: s.color }}>{s.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'oklch(0.88 0.008 264)' }}>{opp.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{opp.skill}</p>
                </div>
                {opp.value && (
                  <span className="text-sm font-black font-mono shrink-0" style={{ color: GOLD }}>
                    £{opp.value.toLocaleString()}
                  </span>
                )}
                {!isWon ? (
                  <button onClick={() => advance(opp)}
                    className="text-xs px-2 py-1 rounded shrink-0"
                    style={{ background: `${s.color}20`, color: s.color }}>→</button>
                ) : (
                  <span className="text-lg shrink-0">🏆</span>
                )}
                <button onClick={() => lose(opp.id)}
                  className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: 'oklch(0.18 0.015 264)', color: MUTED }}>✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
