import { Panel } from './Panel'

export function CalendarCard() {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  return (
    <Panel title="Calendar">
      <div className="flex gap-1">
        {days.map((d, i) => {
          const isToday = i === 0
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-2 px-1 transition-colors ${
                isToday ? 'bg-[var(--color-accent-dim)/20] border border-[var(--color-accent-dim)/40]' : 'hover:bg-[var(--color-ink-1)]'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wide text-[var(--color-ink-3)]">
                {d.toLocaleDateString('en', { weekday: 'short' })}
              </span>
              <span className={`mono text-sm font-semibold ${isToday ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-5)]'}`}>
                {d.getDate()}
              </span>
              <span className="w-1 h-1 rounded-full bg-transparent" />
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[var(--color-ink-2)]">
        Add GOOGLE_CALENDAR_ICAL_URL to load events
      </p>
    </Panel>
  )
}
