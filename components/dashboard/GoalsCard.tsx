'use client'

import { useState } from 'react'
import { Panel } from './Panel'

interface GoalItem {
  id: string
  text: string
  done: boolean
}

function GoalSection({ title, items, onToggle, onAdd, onRemove }: {
  title: string
  items: GoalItem[]
  onToggle: (id: string) => void
  onAdd: (text: string) => void
  onRemove: (id: string) => void
}) {
  const [draft, setDraft] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && draft.trim()) {
      onAdd(draft.trim())
      setDraft('')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
        {title}
      </span>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
            <span className={`block w-3.5 h-3.5 rounded-sm border transition-colors ${item.done ? 'bg-[var(--color-ok)] border-[var(--color-ok)]' : 'border-[var(--color-border)]'}`} />
          </button>
          <span className={`flex-1 text-xs ${item.done ? 'line-through text-[var(--color-ink-3)]' : 'text-[var(--color-ink-5)]'}`}>
            {item.text}
          </span>
          <button
            onClick={() => onRemove(item.id)}
            className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-3)] hover:text-[var(--color-danger)] text-xs transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add goal…"
        className="text-xs bg-transparent border-b border-[var(--color-border)] pb-0.5 outline-none text-[var(--color-ink-4)] placeholder:text-[var(--color-ink-2)] focus:border-[var(--color-accent)]"
      />
    </div>
  )
}

export function GoalsCard() {
  const [week, setWeek] = useState<GoalItem[]>([
    { id: '1', text: 'Set up Supabase', done: false },
    { id: '2', text: 'Deploy to Vercel', done: false },
  ])
  const [month, setMonth] = useState<GoalItem[]>([
    { id: '3', text: 'Complete Personal OS build', done: false },
  ])

  function toggle(setter: typeof setWeek) {
    return (id: string) =>
      setter((prev) => prev.map((g) => g.id === id ? { ...g, done: !g.done } : g))
  }

  function add(setter: typeof setWeek) {
    return (text: string) =>
      setter((prev) => [...prev, { id: String(Date.now()), text, done: false }])
  }

  function remove(setter: typeof setWeek) {
    return (id: string) => setter((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <Panel title="Goals">
      <GoalSection title="This Week" items={week} onToggle={toggle(setWeek)} onAdd={add(setWeek)} onRemove={remove(setWeek)} />
      <div className="border-t border-[var(--color-border)]" />
      <GoalSection title="This Month" items={month} onToggle={toggle(setMonth)} onAdd={add(setMonth)} onRemove={remove(setMonth)} />
    </Panel>
  )
}
