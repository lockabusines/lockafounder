'use client'

const GOLD  = 'oklch(0.78 0.18 80)'
const GREEN = 'oklch(0.68 0.18 145)'
const MUTED = 'oklch(0.40 0.008 264)'
const RED   = 'oklch(0.62 0.22 25)'

interface Props {
  passiveMonthly: number
  target: number
}

export function MumCountdown({ passiveMonthly, target }: Props) {
  const gap = Math.max(0, target - passiveMonthly)
  const pct = Math.min(100, Math.round((passiveMonthly / target) * 100))
  const gapColor = gap === 0 ? GREEN : gap < target * 0.5 ? GOLD : RED

  // Estimate months to goal: assumes £200/mo passive income growth rate
  const GROWTH_RATE = 200
  const monthsLeft = gap > 0 ? Math.ceil(gap / GROWTH_RATE) : 0
  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + monthsLeft)
  const targetDateStr = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div
      className="glass flex flex-col gap-4 p-6 relative overflow-hidden"
      style={{ border: `1px solid ${GOLD}44` }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${GOLD}08 0%, transparent 70%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
            The Mission
          </p>
          <h2 className="text-2xl font-black text-white mt-1">Retire Mum 👑</h2>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Generate £{target.toLocaleString()}/mo in passive income
          </p>
        </div>
        <div
          className="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl shrink-0"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40` }}
        >
          🏠
        </div>
      </div>

      {/* The gap number */}
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: MUTED }}>
          Passive income gap
        </p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black" style={{ color: gapColor }}>
            £{gap.toLocaleString()}
          </span>
          <span className="text-lg" style={{ color: MUTED }}>/mo remaining</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm" style={{ color: GREEN }}>£{passiveMonthly.toLocaleString()}</span>
          <span className="text-xs" style={{ color: MUTED }}>passive now</span>
          <span className="text-xs mx-1" style={{ color: MUTED }}>→</span>
          <span className="text-sm" style={{ color: GOLD }}>£{target.toLocaleString()}</span>
          <span className="text-xs" style={{ color: MUTED }}>target</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10">
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'oklch(0.18 0.015 264)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? GREEN
                : `linear-gradient(90deg, ${GOLD}cc, ${GOLD})`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-mono" style={{ color: GOLD }}>{pct}% there</span>
          {gap > 0 && (
            <span className="text-xs" style={{ color: MUTED }}>
              Est. {targetDateStr} at current pace
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 relative z-10 pt-2" style={{ borderTop: '1px solid oklch(0.18 0.015 264)' }}>
        {[
          { label: 'Monthly target', value: `£${target.toLocaleString()}` },
          { label: 'Currently passive', value: passiveMonthly > 0 ? `£${passiveMonthly.toLocaleString()}` : '£0', highlight: passiveMonthly > 0 },
          { label: 'Gap to close', value: `£${gap.toLocaleString()}`, color: gapColor },
        ].map(({ label, value, color, highlight }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: MUTED }}>{label}</p>
            <p className="text-lg font-black" style={{ color: color ?? (highlight ? GREEN : 'white') }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
