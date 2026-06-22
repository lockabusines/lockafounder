import { Panel } from './Panel'

export function NutritionCard() {
  return (
    <Panel title="Nutrition">
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <div className="flex gap-4">
          {[
            { label: 'KCAL', value: '—', color: 'var(--color-warn)' },
            { label: 'PROT', value: '—', color: 'var(--color-ok)' },
            { label: 'CARB', value: '—', color: 'var(--color-accent)' },
            { label: 'FAT', value: '—', color: 'var(--color-danger)' },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-0.5">
              <span className="mono text-lg font-semibold" style={{ color: m.color }}>{m.value}</span>
              <span className="text-[9px] tracking-widest text-[var(--color-ink-3)]">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-ink-2)] max-w-[180px]">
          Type a meal to get AI-estimated macros — coming once API keys are set up
        </p>
      </div>
    </Panel>
  )
}
