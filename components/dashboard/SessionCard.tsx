import { Panel } from './Panel'

const PLACEHOLDER_TASKS = [
  { id: '1', title: 'Set up Supabase project', estimate: '30m' },
  { id: '2', title: 'Add env vars to .env.local', estimate: '15m' },
  { id: '3', title: 'Deploy to Vercel', estimate: '45m' },
]

export function SessionCard() {
  return (
    <Panel title="Session" badge={
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-dim)/20] text-[var(--color-accent)]">
        Today
      </span>
    }>
      <div className="flex flex-col gap-2">
        {PLACEHOLDER_TASKS.map((task, i) => (
          <div key={task.id} className="flex items-center gap-3">
            <span className="mono text-[10px] text-[var(--color-ink-3)] w-3">{i + 1}</span>
            <span className="flex-1 text-sm text-[var(--color-ink-5)]">{task.title}</span>
            <span className="mono text-[10px] text-[var(--color-ink-3)]">{task.estimate}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[var(--color-ink-2)] mt-1">Connects to CRM once Supabase is set up</p>
    </Panel>
  )
}
