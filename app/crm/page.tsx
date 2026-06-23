'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const GOLD   = 'oklch(0.82 0.18 80)'
const GREEN  = 'oklch(0.72 0.22 155)'
const BLUE   = 'oklch(0.62 0.22 240)'
const CYAN   = 'oklch(0.78 0.22 200)'
const RED    = 'oklch(0.62 0.24 25)'
const PURPLE = 'oklch(0.60 0.26 295)'
const MUTED  = 'oklch(0.50 0.06 220)'
const DIM    = 'rgba(0,10,35,0.6)'

const STAGES = [
  { key: 'lead',      label: 'Lead',       color: CYAN,   icon: '📡' },
  { key: 'quoted',    label: 'Quoted',     color: GOLD,   icon: '📋' },
  { key: 'follow_up', label: 'Follow Up',  color: RED,    icon: '🔔' },
  { key: 'won',       label: 'Won',        color: GREEN,  icon: '✅' },
  { key: 'invoiced',  label: 'Invoiced',   color: PURPLE, icon: '🧾' },
  { key: 'paid',      label: 'Paid',       color: GREEN,  icon: '💰' },
]

const SKILLS = ['solar', 'electrical', 'renovations', 'training', 'ai', 'other']
const SOURCES = ['referral', 'cold', 'social', 'repeat', 'manual']

interface Contact { id: string; name: string; phone?: string; email?: string; company?: string; source: string; skill: string; notes?: string }
interface Job { id: string; name: string; skill: string; status: string; value?: number; notes?: string; due_date?: string; description?: string; contact_id?: string; crm_contacts?: { name: string; phone?: string; company?: string } | null; created_at: string }

type Tab = 'pipeline' | 'contacts' | 'revenue'

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>('pipeline')
  const [jobs, setJobs] = useState<Job[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [jr, cr] = await Promise.all([
      fetch('/api/crm/jobs').then(r => r.ok ? r.json() : []),
      fetch('/api/crm/contacts').then(r => r.ok ? r.json() : []),
    ])
    setJobs(jr); setContacts(cr); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const pipelineValue = jobs.filter(j => !['lost', 'paid'].includes(j.status)).reduce((s, j) => s + (j.value ?? 0), 0)
  const wonValue = jobs.filter(j => j.status === 'paid').reduce((s, j) => s + (j.value ?? 0), 0)
  const followUps = jobs.filter(j => j.status === 'follow_up').length

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs transition-all hover:opacity-70" style={{ color: MUTED }}>← Dashboard</Link>
              <span style={{ color: MUTED }}>·</span>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'Orbitron,sans-serif', color: CYAN }}>CRM</span>
            </div>
            <div className="flex gap-2">
              {followUps > 0 && (
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  style={{ background: `${RED}20`, color: RED, border: `1px solid ${RED}40` }}>
                  🔔 {followUps} follow-up{followUps > 1 ? 's' : ''} due
                </div>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Pipeline value',  value: `£${pipelineValue.toLocaleString()}`, color: CYAN  },
              { label: 'Revenue earned',  value: `£${wonValue.toLocaleString()}`,       color: GREEN },
              { label: 'Active jobs',     value: jobs.filter(j => !['lost','paid'].includes(j.status)).length, color: BLUE },
              { label: 'Contacts',        value: contacts.length,                        color: GOLD  },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass p-4 flex flex-col gap-1">
                <p className="label">{label}</p>
                <p className="text-2xl font-black" style={{ fontFamily: 'Orbitron,sans-serif', color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 glass overflow-hidden">
            {([['pipeline','Pipeline'], ['contacts','Contacts'], ['revenue','Revenue']] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-all"
                style={{
                  fontFamily: 'Orbitron,sans-serif',
                  color: tab === key ? CYAN : MUTED,
                  borderBottom: `2px solid ${tab === key ? CYAN : 'transparent'}`,
                  background: tab === key ? 'rgba(0,180,255,0.06)' : 'transparent',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-20 glass animate-pulse" />)}
            </div>
          ) : tab === 'pipeline' ? (
            <PipelineTab jobs={jobs} contacts={contacts} onUpdate={load} />
          ) : tab === 'contacts' ? (
            <ContactsTab contacts={contacts} onUpdate={load} />
          ) : (
            <RevenueTab jobs={jobs} />
          )}

        </div>
      </main>
    </div>
  )
}

// ── Pipeline Tab ─────────────────────────────────────────────────────────────

function PipelineTab({ jobs, contacts, onUpdate }: { jobs: Job[]; contacts: Contact[]; onUpdate: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', skill: 'other', status: 'lead', value: '', contact_id: '', due_date: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  async function addJob() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/crm/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null, contact_id: form.contact_id || null }),
    })
    setForm({ name: '', skill: 'other', status: 'lead', value: '', contact_id: '', due_date: '', notes: '' })
    setShowAdd(false); setSaving(false); onUpdate()
  }

  async function moveJob(id: string, status: string) {
    await fetch('/api/crm/jobs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    onUpdate()
  }

  async function loseJob(id: string) {
    await fetch('/api/crm/jobs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'lost' }),
    })
    setSelectedJob(null); onUpdate()
  }

  const activeJobs = jobs.filter(j => j.status !== 'lost')

  return (
    <div className="flex flex-col gap-4">
      {/* Add job button */}
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg text-xs font-bold"
          style={{ background: `${CYAN}22`, color: CYAN, border: `1px solid ${CYAN}44`, fontFamily: 'Orbitron,sans-serif' }}>
          + New Job
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass p-5 flex flex-col gap-3" style={{ border: `1px solid ${CYAN}44` }}>
          <p className="label" style={{ color: CYAN }}>New Job / Lead</p>
          <input placeholder="Job name / description" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} className="px-2 py-2 rounded-lg text-xs capitalize">
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-2 py-2 rounded-lg text-xs">
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <input placeholder="£ value" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="px-2 py-2 rounded-lg text-xs" />
            <input placeholder="Due date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="px-2 py-2 rounded-lg text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="px-2 py-2 rounded-lg text-xs">
              <option value="">No contact linked</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
            </select>
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="px-2 py-2 rounded-lg text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={addJob} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{ background: CYAN, color: 'black' }}>{saving ? 'Saving...' : 'Add Job'}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: DIM, color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STAGES.map(stage => {
          const stageJobs = activeJobs.filter(j => j.status === stage.key)
          const stageValue = stageJobs.reduce((s, j) => s + (j.value ?? 0), 0)
          return (
            <div key={stage.key} className="glass flex flex-col gap-0 overflow-hidden"
              style={{ border: `1px solid ${stage.color}33` }}>
              {/* Column header */}
              <div className="px-3 py-2.5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${stage.color}22`, background: `${stage.color}08` }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{stage.icon}</span>
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ fontFamily: 'Orbitron,sans-serif', color: stage.color }}>{stage.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: stage.color }}>{stageJobs.length}</div>
                  {stageValue > 0 && <div className="text-[10px] font-mono" style={{ color: MUTED }}>£{stageValue.toLocaleString()}</div>}
                </div>
              </div>

              {/* Jobs */}
              <div className="flex flex-col divide-y overflow-y-auto max-h-64" style={{ borderColor: 'rgba(0,80,200,0.1)' }}>
                {stageJobs.length === 0 ? (
                  <p className="p-3 text-xs text-center" style={{ color: 'rgba(0,120,255,0.2)' }}>Empty</p>
                ) : stageJobs.map(job => (
                  <button key={job.id} onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className="flex flex-col gap-1 px-3 py-2.5 text-left transition-all w-full"
                    style={{ background: selectedJob?.id === job.id ? `${stage.color}10` : 'transparent' }}>
                    <p className="text-xs font-medium leading-snug" style={{ color: 'rgba(200,230,255,0.9)' }}>{job.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: MUTED }}>{job.skill}</span>
                      {job.crm_contacts?.name && <span className="text-[10px]" style={{ color: stage.color }}>• {job.crm_contacts.name}</span>}
                      {job.value && <span className="text-[10px] font-mono ml-auto" style={{ color: GOLD }}>£{job.value.toLocaleString()}</span>}
                    </div>
                    {job.due_date && <span className="text-[10px]" style={{ color: new Date(job.due_date) < new Date() ? RED : MUTED }}>Due {job.due_date}</span>}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected job detail */}
      {selectedJob && (
        <div className="glass p-5 flex flex-col gap-3" style={{ border: `1px solid ${CYAN}44` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold" style={{ color: 'white' }}>{selectedJob.name}</p>
              {selectedJob.crm_contacts?.name && (
                <p className="text-xs mt-0.5" style={{ color: CYAN }}>
                  {selectedJob.crm_contacts.name}
                  {selectedJob.crm_contacts.company ? ` · ${selectedJob.crm_contacts.company}` : ''}
                  {selectedJob.crm_contacts.phone ? ` · ${selectedJob.crm_contacts.phone}` : ''}
                </p>
              )}
            </div>
            {selectedJob.value && <span className="text-xl font-black font-mono" style={{ color: GOLD }}>£{selectedJob.value.toLocaleString()}</span>}
          </div>
          {selectedJob.notes && <p className="text-xs" style={{ color: MUTED }}>{selectedJob.notes}</p>}

          {/* Move actions */}
          <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid rgba(0,80,200,0.2)' }}>
            <p className="label w-full">Move to</p>
            {STAGES.filter(s => s.key !== selectedJob.status).map(s => (
              <button key={s.key} onClick={() => moveJob(selectedJob.id, s.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
                {s.icon} {s.label}
              </button>
            ))}
            <button onClick={() => loseJob(selectedJob.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold ml-auto"
              style={{ background: `${RED}20`, color: RED, border: `1px solid ${RED}40` }}>
              ✕ Lost
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Contacts Tab ─────────────────────────────────────────────────────────────

function ContactsTab({ contacts, onUpdate }: { contacts: Contact[]; onUpdate: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', source: 'manual', skill: 'other', notes: '' })
  const [search, setSearch] = useState('')

  async function addContact() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/crm/contacts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', phone: '', email: '', company: '', source: 'manual', skill: 'other', notes: '' })
    setShowAdd(false); setSaving(false); onUpdate()
  }

  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-sm" />
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg text-xs font-bold"
          style={{ background: `${GREEN}22`, color: GREEN, border: `1px solid ${GREEN}44`, fontFamily: 'Orbitron,sans-serif' }}>
          + Contact
        </button>
      </div>

      {showAdd && (
        <div className="glass p-5 flex flex-col gap-3" style={{ border: `1px solid ${GREEN}44` }}>
          <p className="label" style={{ color: GREEN }}>New Contact</p>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Full name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-lg text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg text-sm" />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded-lg text-sm" />
            <input placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="px-3 py-2 rounded-lg text-sm" />
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="px-2 py-2 rounded-lg text-xs">
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} className="px-2 py-2 rounded-lg text-xs">
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button onClick={addContact} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: GREEN, color: 'black' }}>
              {saving ? 'Saving...' : 'Save Contact'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: DIM, color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass p-8 text-center">
          <p className="text-sm" style={{ color: MUTED }}>{search ? 'No contacts match.' : 'No contacts yet. Add your first lead.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <div key={c.id} className="glass p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'rgba(0,80,200,0.2)', color: CYAN, border: '1px solid rgba(0,160,255,0.3)' }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'rgba(200,230,255,0.95)' }}>{c.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {c.company && <span className="text-xs" style={{ color: MUTED }}>{c.company}</span>}
                  {c.phone && <span className="text-xs font-mono" style={{ color: CYAN }}>{c.phone}</span>}
                  {c.email && <span className="text-xs" style={{ color: BLUE }}>{c.email}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(0,160,255,0.1)', color: CYAN }}>{c.skill}</span>
                <span className="text-[10px]" style={{ color: MUTED }}>{c.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Revenue Tab ───────────────────────────────────────────────────────────────

function RevenueTab({ jobs }: { jobs: Job[] }) {
  const paid = jobs.filter(j => j.status === 'paid')
  const pipeline = jobs.filter(j => !['lost', 'paid'].includes(j.status))

  const bySkill = SKILLS.map(skill => ({
    skill,
    earned: paid.filter(j => j.skill === skill).reduce((s, j) => s + (j.value ?? 0), 0),
    pipeline: pipeline.filter(j => j.skill === skill).reduce((s, j) => s + (j.value ?? 0), 0),
    count: paid.filter(j => j.skill === skill).length,
  })).filter(s => s.earned > 0 || s.pipeline > 0)

  const totalEarned = paid.reduce((s, j) => s + (j.value ?? 0), 0)
  const totalPipeline = pipeline.reduce((s, j) => s + (j.value ?? 0), 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-5 flex flex-col gap-1" style={{ border: `1px solid ${GREEN}44` }}>
          <p className="label">Total earned</p>
          <p className="text-3xl font-black" style={{ fontFamily: 'Orbitron,sans-serif', color: GREEN }}>£{totalEarned.toLocaleString()}</p>
          <p className="text-xs" style={{ color: MUTED }}>{paid.length} paid jobs</p>
        </div>
        <div className="glass p-5 flex flex-col gap-1" style={{ border: `1px solid ${CYAN}44` }}>
          <p className="label">In pipeline</p>
          <p className="text-3xl font-black" style={{ fontFamily: 'Orbitron,sans-serif', color: CYAN }}>£{totalPipeline.toLocaleString()}</p>
          <p className="text-xs" style={{ color: MUTED }}>{pipeline.length} active jobs</p>
        </div>
      </div>

      {/* By skill */}
      <div className="glass flex flex-col gap-0 overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,80,200,0.2)' }}>
          <p className="label" style={{ color: CYAN }}>Revenue by skill</p>
        </div>
        {bySkill.length === 0 ? (
          <p className="p-5 text-sm text-center" style={{ color: MUTED }}>No revenue data yet. Mark jobs as paid to track here.</p>
        ) : bySkill.sort((a, b) => b.earned - a.earned).map(({ skill, earned, pipeline: pipe, count }) => {
          const maxVal = Math.max(...bySkill.map(s => s.earned + s.pipeline), 1)
          const pct = Math.round(((earned + pipe) / maxVal) * 100)
          return (
            <div key={skill} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,40,120,0.15)' }}>
              <span className="text-xs font-bold capitalize w-24 shrink-0" style={{ fontFamily: 'Orbitron,sans-serif', color: CYAN }}>{skill}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full overflow-hidden flex gap-px" style={{ background: 'rgba(0,20,60,0.6)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.round((earned / (maxVal || 1)) * 100)}%`, background: GREEN }} />
                  <div className="h-full rounded-full" style={{ width: `${Math.round((pipe / (maxVal || 1)) * 100)}%`, background: `${CYAN}80` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black font-mono" style={{ color: GREEN }}>£{earned.toLocaleString()}</p>
                {pipe > 0 && <p className="text-xs font-mono" style={{ color: CYAN }}>+£{pipe.toLocaleString()} pending</p>}
                <p className="text-[10px]" style={{ color: MUTED }}>{count} paid</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Paid jobs log */}
      {paid.length > 0 && (
        <div className="glass flex flex-col gap-0 overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,80,200,0.2)' }}>
            <p className="label" style={{ color: GREEN }}>Paid jobs log</p>
          </div>
          {paid.map(job => (
            <div key={job.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,40,120,0.1)' }}>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize" style={{ background: `${GREEN}20`, color: GREEN }}>{job.skill}</span>
              <span className="flex-1 text-sm" style={{ color: 'rgba(200,230,255,0.85)' }}>{job.name}</span>
              {job.crm_contacts?.name && <span className="text-xs" style={{ color: MUTED }}>{job.crm_contacts.name}</span>}
              <span className="text-sm font-black font-mono" style={{ color: GREEN }}>£{(job.value ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
