'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

// ── Design tokens ──────────────────────────────────────────────────────────
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

const STAGES = [
  { key: 'lead',      label: 'Lead',       color: G.blue   },
  { key: 'quoted',    label: 'Quoted',     color: G.gold   },
  { key: 'follow_up', label: 'Follow Up',  color: G.red    },
  { key: 'won',       label: 'Won',        color: G.green  },
  { key: 'invoiced',  label: 'Invoiced',   color: G.purple },
  { key: 'paid',      label: 'Paid',       color: G.green  },
]

const ACCOUNT_STATUSES = ['lead', 'active', 'churned']
const SKILLS     = ['solar', 'electrical', 'renovations', 'training', 'ai', 'other']
const SOURCES    = ['referral', 'cold', 'social', 'repeat', 'inbound', 'manual']
const INDUSTRIES = ['construction', 'property', 'energy', 'retail', 'hospitality', 'tech', 'other']
const SIZES      = ['1–10', '11–50', '51–200', '200+']

// ── Types ──────────────────────────────────────────────────────────────────
interface Contact {
  id: string
  name: string
  job_title?: string
  phone?: string
  email?: string
  linkedin?: string
  company?: string
  website?: string
  industry?: string
  company_size?: string
  location?: string
  source: string
  skill: string
  account_status: string
  owner?: string
  notes?: string
  next_steps?: string
  interaction_log?: string
  last_contact_date?: string
  created_at: string
}

interface Job {
  id: string
  name: string
  skill: string
  status: string
  value?: number
  notes?: string
  due_date?: string
  expected_close_date?: string
  loss_reason?: string
  next_steps?: string
  interaction_log?: string
  last_contact_date?: string
  owner?: string
  contact_id?: string
  crm_contacts?: { name: string; phone?: string; company?: string; job_title?: string; linkedin?: string } | null
  created_at: string
}

type Tab = 'pipeline' | 'contacts' | 'revenue'

// ── Page ───────────────────────────────────────────────────────────────────
export default function CRMPage() {
  const [tab, setTab]         = useState<Tab>('pipeline')
  const [jobs, setJobs]       = useState<Job[]>([])
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

  const activeJobs    = jobs.filter(j => !['lost', 'paid'].includes(j.status))
  const pipelineValue = activeJobs.reduce((s, j) => s + (j.value ?? 0), 0)
  const wonValue      = jobs.filter(j => j.status === 'paid').reduce((s, j) => s + (j.value ?? 0), 0)
  const followUps     = jobs.filter(j => j.status === 'follow_up').length

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
            <Link href="/" className="hover:opacity-70 transition-opacity">Dashboard</Link>
            <span style={{ color: G.faint }}>/</span>
            <span style={{ color: '#f0f0f0' }}>CRM</span>
            {followUps > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: `${G.red}18`, color: G.red, border: `1px solid ${G.red}33` }}>
                {followUps} follow-up{followUps > 1 ? 's' : ''} due
              </span>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: '01', label: 'Pipeline',      value: `£${pipelineValue.toLocaleString()}`, color: G.blue  },
              { id: '02', label: 'Revenue earned', value: `£${wonValue.toLocaleString()}`,       color: G.green },
              { id: '03', label: 'Active jobs',    value: activeJobs.length,                     color: G.gold  },
              { id: '04', label: 'Contacts',       value: contacts.length,                       color: G.purple },
            ].map(({ id, label, value, color }) => (
              <div key={id} className="p-4 flex flex-col gap-1" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 6 }}>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: G.faint, fontSize: '0.58rem' }}>{id} //</span>
                  <span style={{ color: G.muted, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
                </div>
                <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: `1px solid ${G.border}` }}>
            {(['pipeline', 'contacts', 'revenue'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{
                  color: tab === t ? '#f0f0f0' : G.muted,
                  borderBottom: `2px solid ${tab === t ? G.green : 'transparent'}`,
                  marginBottom: -1,
                }}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded animate-pulse" style={{ background: G.card }} />)}
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

// ── Shared field row ────────────────────────────────────────────────────────
function Field({ label, value, accent }: { label: string; value?: string | null; accent?: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ color: G.faint, fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: accent ?? '#e0e0e0', fontSize: '0.8rem' }}>{value}</span>
    </div>
  )
}

// ── Pipeline Tab ────────────────────────────────────────────────────────────
function PipelineTab({ jobs, contacts, onUpdate }: { jobs: Job[]; contacts: Contact[]; onUpdate: () => void }) {
  const [showAdd, setShowAdd]       = useState(false)
  const [selected, setSelected]     = useState<Job | null>(null)
  const [editingLog, setEditingLog] = useState(false)
  const [logText, setLogText]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [form, setForm] = useState({
    name: '', skill: 'other', status: 'lead', value: '',
    contact_id: '', due_date: '', expected_close_date: '',
    owner: '', notes: '', next_steps: '',
  })

  async function addJob() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/crm/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null, contact_id: form.contact_id || null }),
    })
    setForm({ name: '', skill: 'other', status: 'lead', value: '', contact_id: '', due_date: '', expected_close_date: '', owner: '', notes: '', next_steps: '' })
    setShowAdd(false); setSaving(false); onUpdate()
  }

  async function moveJob(id: string, status: string, extra?: Record<string, string>) {
    await fetch('/api/crm/jobs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...extra }),
    })
    setSelected(null); onUpdate()
  }

  async function saveLog(id: string) {
    const existing = selected?.interaction_log ?? ''
    const entry = `[${new Date().toLocaleDateString('en-GB')}] ${logText}`
    const updated = existing ? `${existing}\n${entry}` : entry
    await fetch('/api/crm/jobs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, interaction_log: updated, last_contact_date: new Date().toISOString().split('T')[0] }),
    })
    setLogText(''); setEditingLog(false); onUpdate()
  }

  async function saveNextSteps(id: string, next_steps: string) {
    await fetch('/api/crm/jobs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, next_steps }),
    })
    onUpdate()
  }

  const activeJobs = jobs.filter(j => j.status !== 'lost')
  const [lossReason, setLossReason] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-2 rounded text-xs font-semibold"
          style={{ background: `${G.blue}18`, color: G.blue, border: `1px solid ${G.blue}33` }}>
          + New Job
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-5 flex flex-col gap-3 rounded" style={{ background: G.card2, border: `1px solid ${G.border}` }}>
          <div className="flex items-center gap-2">
            <span style={{ color: G.faint, fontSize: '0.58rem' }}>NEW //</span>
            <span style={{ color: G.blue, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Job / Lead</span>
          </div>
          <input placeholder="Job description *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded text-sm" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} className="px-2 py-2 rounded text-xs capitalize">
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-2 py-2 rounded text-xs">
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <input placeholder="£ value" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="px-2 py-2 rounded text-xs" />
            <input placeholder="Due date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="px-2 py-2 rounded text-xs" />
            <input placeholder="Expected close" type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))} className="px-2 py-2 rounded text-xs" />
            <input placeholder="Owner" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} className="px-2 py-2 rounded text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="px-2 py-2 rounded text-xs">
              <option value="">No contact linked</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
            </select>
            <input placeholder="Next steps" value={form.next_steps} onChange={e => setForm(f => ({ ...f, next_steps: e.target.value }))} className="px-2 py-2 rounded text-xs" />
          </div>
          <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 rounded text-xs" />
          <div className="flex gap-2">
            <button onClick={addJob} disabled={saving} className="flex-1 py-2 rounded text-xs font-bold" style={{ background: G.blue, color: '#000' }}>
              {saving ? 'Saving…' : 'Add Job'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded text-xs" style={{ color: G.muted }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {STAGES.map(stage => {
          const stageJobs  = activeJobs.filter(j => j.status === stage.key)
          const stageValue = stageJobs.reduce((s, j) => s + (j.value ?? 0), 0)
          return (
            <div key={stage.key} className="flex flex-col overflow-hidden rounded"
              style={{ background: G.card, border: `1px solid ${G.border}` }}>
              <div className="px-3 py-2 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${G.border}`, borderLeft: `2px solid ${stage.color}` }}>
                <span style={{ color: stage.color, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{stage.label}</span>
                <div className="text-right">
                  <span style={{ color: stage.color, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>{stageJobs.length}</span>
                  {stageValue > 0 && <span style={{ color: G.muted, fontSize: '0.58rem', display: 'block', fontFamily: 'var(--font-geist-mono)' }}>£{stageValue.toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex flex-col divide-y max-h-56 overflow-y-auto" style={{ borderColor: G.border }}>
                {stageJobs.length === 0 ? (
                  <p className="p-3 text-xs text-center" style={{ color: 'rgba(255,255,255,0.1)' }}>—</p>
                ) : stageJobs.map(job => (
                  <button key={job.id} onClick={() => setSelected(selected?.id === job.id ? null : job)}
                    className="flex flex-col gap-1 px-3 py-2.5 text-left w-full transition-colors"
                    style={{ background: selected?.id === job.id ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                    <p className="text-xs font-medium leading-snug" style={{ color: '#e8e8e8' }}>{job.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: G.muted, fontSize: '0.62rem' }}>{job.skill}</span>
                      {job.crm_contacts?.name && <span style={{ color: stage.color, fontSize: '0.62rem' }}>· {job.crm_contacts.name}</span>}
                      {job.value && <span style={{ color: G.gold, fontSize: '0.62rem', fontFamily: 'var(--font-geist-mono)', marginLeft: 'auto' }}>£{job.value.toLocaleString()}</span>}
                    </div>
                    {job.due_date && <span style={{ color: new Date(job.due_date) < new Date() ? G.red : G.muted, fontSize: '0.58rem' }}>Due {job.due_date}</span>}
                    {job.next_steps && <span style={{ color: G.green, fontSize: '0.58rem' }}>→ {job.next_steps}</span>}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Job detail panel */}
      {selected && (
        <div className="p-5 flex flex-col gap-4 rounded" style={{ background: G.card2, border: `1px solid ${G.border}` }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold" style={{ color: '#f0f0f0' }}>{selected.name}</p>
              {selected.crm_contacts && (
                <p className="text-xs mt-0.5" style={{ color: G.blue }}>
                  {selected.crm_contacts.name}
                  {selected.crm_contacts.job_title ? ` · ${selected.crm_contacts.job_title}` : ''}
                  {selected.crm_contacts.company ? ` · ${selected.crm_contacts.company}` : ''}
                  {selected.crm_contacts.phone ? ` · ${selected.crm_contacts.phone}` : ''}
                </p>
              )}
              {selected.crm_contacts?.linkedin && (
                <a href={selected.crm_contacts.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-xs hover:underline" style={{ color: G.blue }}>LinkedIn →</a>
              )}
            </div>
            {selected.value && <span className="text-2xl font-black font-mono" style={{ color: G.gold }}>£{selected.value.toLocaleString()}</span>}
          </div>

          {/* Deal info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Skill"          value={selected.skill} />
            <Field label="Owner"          value={selected.owner} />
            <Field label="Due date"       value={selected.due_date} />
            <Field label="Expected close" value={selected.expected_close_date} />
            <Field label="Last contact"   value={selected.last_contact_date} />
            <Field label="Status"         value={STAGES.find(s => s.key === selected.status)?.label} />
          </div>

          {selected.notes && (
            <div>
              <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Notes</p>
              <p className="text-xs" style={{ color: G.muted }}>{selected.notes}</p>
            </div>
          )}

          {/* Next steps */}
          <NextStepsEditor
            value={selected.next_steps}
            onSave={(val) => saveNextSteps(selected.id, val)}
          />

          {/* Interaction log */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Interaction Log</p>
              <button onClick={() => setEditingLog(!editingLog)}
                className="text-xs px-2 py-1 rounded"
                style={{ color: G.green, background: `${G.green}12`, border: `1px solid ${G.green}22` }}>
                + Log entry
              </button>
            </div>
            {editingLog && (
              <div className="flex gap-2">
                <input value={logText} onChange={e => setLogText(e.target.value)}
                  placeholder="What happened? Call, email, meeting…"
                  className="flex-1 px-3 py-2 rounded text-xs" onKeyDown={e => e.key === 'Enter' && saveLog(selected.id)} />
                <button onClick={() => saveLog(selected.id)} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: G.green, color: '#000' }}>Save</button>
              </div>
            )}
            {selected.interaction_log && (
              <div className="rounded p-3 font-mono text-xs whitespace-pre-line" style={{ background: 'rgba(0,0,0,0.3)', color: G.muted, fontSize: '0.72rem', maxHeight: 150, overflowY: 'auto' }}>
                {selected.interaction_log}
              </div>
            )}
          </div>

          {/* Move actions */}
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${G.border}` }}>
            <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', width: '100%' }}>Move to</p>
            {STAGES.filter(s => s.key !== selected.status).map(s => (
              <button key={s.key} onClick={() => moveJob(selected.id, s.key)}
                className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{ background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}30` }}>
                {s.label}
              </button>
            ))}
            <button
              onClick={() => {
                const reason = prompt('Loss reason (optional):') ?? ''
                moveJob(selected.id, 'lost', reason ? { loss_reason: reason } : {})
              }}
              className="px-3 py-1.5 rounded text-xs font-semibold ml-auto"
              style={{ background: `${G.red}14`, color: G.red, border: `1px solid ${G.red}30` }}>
              ✕ Lost
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Next Steps inline editor ────────────────────────────────────────────────
function NextStepsEditor({ value, onSave }: { value?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value ?? '')
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next Steps</p>
        <button onClick={() => setEditing(!editing)} className="text-xs" style={{ color: G.muted }}>edit</button>
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} className="flex-1 px-3 py-2 rounded text-xs"
            placeholder="What's the next action?" onKeyDown={e => { if (e.key === 'Enter') { onSave(text); setEditing(false) } }} />
          <button onClick={() => { onSave(text); setEditing(false) }} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: G.green, color: '#000' }}>Save</button>
        </div>
      ) : (
        <p className="text-xs" style={{ color: value ? G.green : 'rgba(255,255,255,0.15)' }}>{value || 'No next steps set'}</p>
      )}
    </div>
  )
}

// ── Contacts Tab ─────────────────────────────────────────────────────────────
function ContactsTab({ contacts, onUpdate }: { contacts: Contact[]; onUpdate: () => void }) {
  const [showAdd, setShowAdd]   = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [editingLog, setEditingLog] = useState(false)
  const [logText, setLogText]   = useState('')
  const [form, setForm] = useState({
    name: '', job_title: '', phone: '', email: '', linkedin: '',
    company: '', website: '', industry: 'other', company_size: '1–10',
    location: '', source: 'manual', skill: 'other',
    account_status: 'lead', owner: '', notes: '', next_steps: '',
  })

  async function addContact() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/crm/contacts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', job_title: '', phone: '', email: '', linkedin: '', company: '', website: '', industry: 'other', company_size: '1–10', location: '', source: 'manual', skill: 'other', account_status: 'lead', owner: '', notes: '', next_steps: '' })
    setShowAdd(false); setSaving(false); onUpdate()
  }

  async function saveLog(id: string) {
    const existing = selected?.interaction_log ?? ''
    const entry = `[${new Date().toLocaleDateString('en-GB')}] ${logText}`
    const updated = existing ? `${existing}\n${entry}` : entry
    await fetch('/api/crm/contacts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, interaction_log: updated, last_contact_date: new Date().toISOString().split('T')[0] }),
    })
    setLogText(''); setEditingLog(false); onUpdate()
  }

  async function updateStatus(id: string, account_status: string) {
    await fetch('/api/crm/contacts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, account_status }),
    })
    onUpdate()
  }

  const STATUS_COLOR: Record<string, string> = { lead: G.blue, active: G.green, churned: G.red }

  const filtered = contacts.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input placeholder="Search by name, company, phone…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-3 py-2 rounded text-sm" />
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-2 rounded text-xs font-semibold"
          style={{ background: `${G.green}18`, color: G.green, border: `1px solid ${G.green}33` }}>
          + Contact
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-5 flex flex-col gap-3 rounded" style={{ background: G.card2, border: `1px solid ${G.border}` }}>
          <p style={{ color: G.green, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Contact</p>

          {/* Identity */}
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Full name *"  value={form.name}      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}      className="px-3 py-2 rounded text-sm" />
            <input placeholder="Job title"    value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} className="px-3 py-2 rounded text-sm" />
            <input placeholder="Email"        value={form.email}     onChange={e => setForm(f => ({ ...f, email: e.target.value }))}     className="px-3 py-2 rounded text-sm" />
            <input placeholder="Phone"        value={form.phone}     onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}     className="px-3 py-2 rounded text-sm" />
            <input placeholder="LinkedIn URL" value={form.linkedin}  onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}  className="px-3 py-2 rounded text-sm col-span-2" />
          </div>

          {/* Company */}
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company"  value={form.company}  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}  className="px-3 py-2 rounded text-sm" />
            <input placeholder="Website"  value={form.website}  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}  className="px-3 py-2 rounded text-sm" />
            <input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="px-3 py-2 rounded text-sm" />
            <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="px-2 py-2 rounded text-xs capitalize">
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={form.company_size} onChange={e => setForm(f => ({ ...f, company_size: e.target.value }))} className="px-2 py-2 rounded text-xs">
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>

          {/* Lead info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="px-2 py-2 rounded text-xs">
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} className="px-2 py-2 rounded text-xs">
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.account_status} onChange={e => setForm(f => ({ ...f, account_status: e.target.value }))} className="px-2 py-2 rounded text-xs capitalize">
              {ACCOUNT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Owner" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} className="px-2 py-2 rounded text-xs" />
          </div>

          <input placeholder="Next steps" value={form.next_steps} onChange={e => setForm(f => ({ ...f, next_steps: e.target.value }))} className="w-full px-3 py-2 rounded text-sm" />
          <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 rounded text-sm" />

          <div className="flex gap-2">
            <button onClick={addContact} disabled={saving} className="flex-1 py-2 rounded text-xs font-bold" style={{ background: G.green, color: '#000' }}>
              {saving ? 'Saving…' : 'Save Contact'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded text-xs" style={{ color: G.muted }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded" style={{ background: G.card }}>
          <p className="text-sm" style={{ color: G.muted }}>{search ? 'No contacts match.' : 'No contacts yet.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => {
            const statusColor = STATUS_COLOR[c.account_status] ?? G.muted
            return (
              <div key={c.id}>
                <button onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  className="glass p-4 flex items-center gap-4 w-full text-left transition-colors hover:border-white/15"
                  style={{ borderLeft: `2px solid ${statusColor}` }}>
                  <div className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#e0e0e0' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>{c.name}</p>
                      {c.job_title && <span className="text-xs" style={{ color: G.muted }}>· {c.job_title}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {c.company  && <span className="text-xs" style={{ color: G.muted }}>{c.company}</span>}
                      {c.location && <span className="text-xs" style={{ color: G.muted }}>{c.location}</span>}
                      {c.phone    && <span className="text-xs font-mono" style={{ color: G.blue }}>{c.phone}</span>}
                      {c.email    && <span className="text-xs" style={{ color: G.muted }}>{c.email}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold capitalize"
                      style={{ background: `${statusColor}18`, color: statusColor }}>{c.account_status}</span>
                    <span className="text-xs" style={{ color: G.faint }}>{c.source}</span>
                  </div>
                </button>

                {/* Contact detail */}
                {selected?.id === c.id && (
                  <div className="p-5 flex flex-col gap-4 rounded-b" style={{ background: G.card2, border: `1px solid ${G.border}`, borderTop: 'none' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Field label="Job title"   value={c.job_title} />
                      <Field label="Industry"    value={c.industry} />
                      <Field label="Company size" value={c.company_size ? `${c.company_size} employees` : undefined} />
                      <Field label="Website"     value={c.website} accent={G.blue} />
                      <Field label="Owner"       value={c.owner} />
                      <Field label="Skill"       value={c.skill} />
                      <Field label="Last contact" value={c.last_contact_date} />
                    </div>

                    {c.linkedin && (
                      <a href={c.linkedin} target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:underline w-fit" style={{ color: G.blue }}>LinkedIn →</a>
                    )}

                    {c.next_steps && (
                      <div>
                        <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Next Steps</p>
                        <p className="text-xs" style={{ color: G.green }}>{c.next_steps}</p>
                      </div>
                    )}

                    {c.notes && (
                      <div>
                        <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Notes</p>
                        <p className="text-xs" style={{ color: G.muted }}>{c.notes}</p>
                      </div>
                    )}

                    {/* Interaction log */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p style={{ color: G.faint, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Interaction Log</p>
                        <button onClick={() => setEditingLog(!editingLog)} className="text-xs px-2 py-1 rounded"
                          style={{ color: G.green, background: `${G.green}12`, border: `1px solid ${G.green}22` }}>
                          + Log entry
                        </button>
                      </div>
                      {editingLog && (
                        <div className="flex gap-2">
                          <input value={logText} onChange={e => setLogText(e.target.value)} placeholder="What happened?"
                            className="flex-1 px-3 py-2 rounded text-xs"
                            onKeyDown={e => e.key === 'Enter' && saveLog(c.id)} />
                          <button onClick={() => saveLog(c.id)} className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: G.green, color: '#000' }}>Save</button>
                        </div>
                      )}
                      {c.interaction_log && (
                        <div className="rounded p-3 font-mono text-xs whitespace-pre-line"
                          style={{ background: 'rgba(0,0,0,0.3)', color: G.muted, fontSize: '0.72rem', maxHeight: 140, overflowY: 'auto' }}>
                          {c.interaction_log}
                        </div>
                      )}
                    </div>

                    {/* Status change */}
                    <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: `1px solid ${G.border}` }}>
                      <p style={{ color: G.faint, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', width: '100%' }}>Account status</p>
                      {ACCOUNT_STATUSES.filter(s => s !== c.account_status).map(s => (
                        <button key={s} onClick={() => updateStatus(c.id, s)}
                          className="px-3 py-1.5 rounded text-xs font-semibold capitalize"
                          style={{ background: `${STATUS_COLOR[s]}14`, color: STATUS_COLOR[s], border: `1px solid ${STATUS_COLOR[s]}30` }}>
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Revenue Tab ────────────────────────────────────────────────────────────
function RevenueTab({ jobs }: { jobs: Job[] }) {
  const paid     = jobs.filter(j => j.status === 'paid')
  const pipeline = jobs.filter(j => !['lost', 'paid'].includes(j.status))
  const lost     = jobs.filter(j => j.status === 'lost')

  const totalEarned   = paid.reduce((s, j) => s + (j.value ?? 0), 0)
  const totalPipeline = pipeline.reduce((s, j) => s + (j.value ?? 0), 0)
  const totalLost     = lost.reduce((s, j) => s + (j.value ?? 0), 0)

  const bySkill = SKILLS.map(skill => ({
    skill,
    earned:   paid.filter(j => j.skill === skill).reduce((s, j) => s + (j.value ?? 0), 0),
    pipeline: pipeline.filter(j => j.skill === skill).reduce((s, j) => s + (j.value ?? 0), 0),
    count:    paid.filter(j => j.skill === skill).length,
  })).filter(s => s.earned > 0 || s.pipeline > 0)

  // Loss reasons
  const lossReasons = lost
    .filter(j => j.loss_reason)
    .map(j => j.loss_reason!)
    .reduce((acc, r) => { acc[r] = (acc[r] ?? 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total earned',    value: `£${totalEarned.toLocaleString()}`,   sub: `${paid.length} paid jobs`,     color: G.green  },
          { label: 'In pipeline',     value: `£${totalPipeline.toLocaleString()}`, sub: `${pipeline.length} active`,    color: G.blue   },
          { label: 'Lost deals',      value: `£${totalLost.toLocaleString()}`,     sub: `${lost.length} lost`,          color: G.red    },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="p-4 flex flex-col gap-1 rounded" style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `2px solid ${color}` }}>
            <p style={{ color: G.muted, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
            <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
            <p style={{ color: G.faint, fontSize: '0.7rem' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue by skill */}
      <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
          <p style={{ color: G.muted, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Revenue by skill</p>
        </div>
        {bySkill.length === 0 ? (
          <p className="p-5 text-sm text-center" style={{ color: G.muted }}>No revenue yet. Mark jobs as paid.</p>
        ) : bySkill.sort((a, b) => b.earned - a.earned).map(({ skill, earned, pipeline: pipe, count }) => {
          const maxVal = Math.max(...bySkill.map(s => s.earned + s.pipeline), 1)
          return (
            <div key={skill} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <span className="text-xs font-semibold capitalize w-24 shrink-0" style={{ color: '#e0e0e0' }}>{skill}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full" style={{ width: `${Math.round((earned / maxVal) * 100)}%`, background: G.green }} />
                <div className="h-full" style={{ width: `${Math.round((pipe / maxVal) * 100)}%`, background: `${G.blue}60` }} />
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black font-mono" style={{ color: G.green }}>£{earned.toLocaleString()}</p>
                {pipe > 0 && <p className="text-xs font-mono" style={{ color: G.blue }}>+£{pipe.toLocaleString()}</p>}
                <p style={{ color: G.faint, fontSize: '0.62rem' }}>{count} paid</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Loss reasons */}
      {Object.keys(lossReasons).length > 0 && (
        <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
            <p style={{ color: G.muted, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loss reasons</p>
          </div>
          {Object.entries(lossReasons).map(([reason, count]) => (
            <div key={reason} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <span className="text-sm" style={{ color: '#e0e0e0' }}>{reason}</span>
              <span className="text-sm font-mono" style={{ color: G.red }}>{count}×</span>
            </div>
          ))}
        </div>
      )}

      {/* Paid log */}
      {paid.length > 0 && (
        <div className="rounded overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <div className="px-5 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
            <p style={{ color: G.muted, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Paid jobs</p>
          </div>
          {paid.map(job => (
            <div key={job.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <span className="text-xs px-1.5 py-0.5 rounded capitalize font-semibold" style={{ background: `${G.green}18`, color: G.green }}>{job.skill}</span>
              <span className="flex-1 text-sm" style={{ color: '#e0e0e0' }}>{job.name}</span>
              {job.crm_contacts?.name && <span className="text-xs" style={{ color: G.muted }}>{job.crm_contacts.name}</span>}
              {job.owner && <span className="text-xs" style={{ color: G.muted }}>· {job.owner}</span>}
              <span className="text-sm font-black font-mono" style={{ color: G.green }}>£{(job.value ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
