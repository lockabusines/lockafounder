import { Panel } from './Panel'

export function FinanceCard() {
  return (
    <Panel title="Finance Pulse">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end gap-1">
          <span className="mono text-2xl font-semibold text-[var(--color-ink-5)]">—</span>
          <span className="text-xs text-[var(--color-ink-3)] mb-1">net worth</span>
        </div>
        <p className="text-[10px] text-[var(--color-ink-2)]">
          Connect your Google Sheet + service account to enable AI extraction
        </p>
        <button
          disabled
          className="mt-2 text-[10px] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-ink-3)] opacity-40 cursor-not-allowed"
        >
          Refresh snapshot
        </button>
      </div>
    </Panel>
  )
}
