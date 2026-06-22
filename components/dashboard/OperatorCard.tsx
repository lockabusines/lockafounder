import { Panel } from './Panel'

const CONFIG = {
  name: 'Ernest',
  role: 'Builder',
  location: 'Home',
  focus: 'Building Personal OS',
}

export function OperatorCard() {
  return (
    <Panel title="Operator">
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-[var(--color-ink-5)]">{CONFIG.name}</p>
        <p className="text-xs text-[var(--color-ink-3)]">{CONFIG.role} · {CONFIG.location}</p>
        <div className="mt-1 flex items-start gap-2">
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-ok)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-ink-4)]">{CONFIG.focus}</span>
        </div>
      </div>
    </Panel>
  )
}
