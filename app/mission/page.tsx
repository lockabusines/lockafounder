'use client'

import { useEffect, useState } from 'react'
import { TopRail } from '@/components/dashboard/TopRail'
import { MumCountdown } from '@/components/mission/MumCountdown'
import { IncomeStreams } from '@/components/mission/IncomeStreams'
import { OpportunityPipeline } from '@/components/mission/OpportunityPipeline'
import Link from 'next/link'

const MUM_TARGET = 2500  // £ per month passive income needed

const GOLD  = 'oklch(0.78 0.18 80)'
const GREEN = 'oklch(0.68 0.18 145)'
const BLUE  = 'oklch(0.65 0.20 250)'
const MUTED = 'oklch(0.40 0.008 264)'

interface Stream { type: string; monthly_amount: number }

const NEXT_INCOME_IDEAS = [
  { idea: 'Offer solar panel cleaning service — no install needed, recurring income', skill: 'Solar', roi: 5 },
  { idea: 'Start a YouTube channel teaching electrical tips — ad revenue over time', skill: 'Electrical', roi: 3 },
  { idea: 'Find one property to renovate and flip or rent', skill: 'Renovations', roi: 5 },
  { idea: 'Take on 2 personal training clients at evenings/weekends', skill: 'Training', roi: 4 },
  { idea: 'Build an AI tool for tradespeople — charge a monthly subscription', skill: 'AI', roi: 4 },
  { idea: 'Create a simple course on solar installation basics and sell it online', skill: 'Solar', roi: 4 },
]

export default function MissionPage() {
  const [streams, setStreams] = useState<Stream[]>([])

  useEffect(() => {
    fetch('/api/income-streams').then(r => r.ok ? r.json() : []).then(setStreams).catch(() => {})
  }, [])

  const passiveMonthly = streams.filter(s => s.type === 'passive').reduce((sum, s) => sum + s.monthly_amount, 0)
  const activeMonthly  = streams.filter(s => s.type === 'active').reduce((sum, s) => sum + s.monthly_amount, 0)
  const gap = Math.max(0, MUM_TARGET - passiveMonthly)
  const passivePct = activeMonthly > 0 ? Math.round((passiveMonthly / (passiveMonthly + activeMonthly)) * 100) : 0

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />

      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">

          {/* Back link */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs transition-all hover:opacity-70" style={{ color: MUTED }}>
              ← Dashboard
            </Link>
            <span style={{ color: MUTED }}>·</span>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
              Mission Control
            </span>
          </div>

          {/* North Star */}
          <MumCountdown passiveMonthly={passiveMonthly} target={MUM_TARGET} />

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Left */}
            <div className="flex flex-col gap-4">
              <IncomeStreams />

              {/* Passive vs Active ratio */}
              <div className="glass p-5 flex flex-col gap-3">
                <p className="text-sm font-bold tracking-wider uppercase" style={{ color: GOLD }}>
                  Passive vs Active Split
                </p>
                <p className="text-xs" style={{ color: MUTED }}>
                  Goal: flip this ratio. Right now you trade time for money. Build until passive flips active.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-4 rounded-full overflow-hidden flex" style={{ background: 'oklch(0.18 0.015 264)' }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${passivePct}%`, background: GREEN }}
                    />
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${100 - passivePct}%`, background: BLUE }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span style={{ color: GREEN }}>Passive {passivePct}%</span>
                  <span style={{ color: BLUE }}>Active {100 - passivePct}%</span>
                </div>
                {passivePct === 0 && (
                  <p className="text-xs p-3 rounded-lg" style={{ background: `${GOLD}10`, color: GOLD, border: `1px solid ${GOLD}30` }}>
                    ⚡ 100% active right now. Every passive stream you add shifts this bar. First goal: get to 10% passive.
                  </p>
                )}
              </div>

              {/* Hours: Trading vs Building */}
              <div className="glass p-5 flex flex-col gap-3">
                <p className="text-sm font-bold tracking-wider uppercase" style={{ color: BLUE }}>
                  Hours Check
                </p>
                <p className="text-xs" style={{ color: MUTED }}>
                  After your 9-5, are you selling time or building assets?
                </p>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { label: 'Hours trading time (freelance)', color: BLUE, tip: 'Cash now, but no leverage' },
                    { label: 'Hours building assets', color: GREEN, tip: 'This is the game — systems, content, business' },
                  ].map(({ label, color, tip }) => (
                    <div key={label} className="p-3 rounded-xl flex flex-col gap-1"
                      style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
                      <p className="text-[10px]" style={{ color: MUTED }}>{tip}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: MUTED }}>
                  Track this weekly with /week in Telegram.
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              <OpportunityPipeline />

              {/* Next income unlock */}
              <div className="glass p-5 flex flex-col gap-3" style={{ border: `1px solid ${GOLD}33` }}>
                <p className="text-sm font-bold tracking-wider uppercase" style={{ color: GOLD }}>
                  Next Income Unlocks
                </p>
                <p className="text-xs" style={{ color: MUTED }}>
                  Ideas matched to your skills that could add a new stream
                </p>
                <div className="flex flex-col gap-2 mt-1">
                  {NEXT_INCOME_IDEAS.map((idea, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'oklch(0.13 0.015 264)', border: '1px solid oklch(0.20 0.015 264)' }}>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                        style={{ background: `${GOLD}20`, color: GOLD }}>{idea.skill}</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.78 0.008 264)' }}>{idea.idea}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily non-negotiable */}
              <div className="glass p-5 flex flex-col gap-3">
                <p className="text-sm font-bold tracking-wider uppercase" style={{ color: GREEN }}>
                  Daily Non-Negotiables
                </p>
                <p className="text-xs" style={{ color: MUTED }}>One income action per day. These compound.</p>
                {[
                  { action: 'Do one thing that could make money today', icon: '💰' },
                  { action: 'Add or follow up at least one opportunity', icon: '📞' },
                  { action: 'Learn one thing about building income', icon: '📚' },
                  { action: 'Train — discipline is your competitive edge', icon: '💪' },
                ].map(({ action, icon }) => (
                  <div key={action} className="flex items-center gap-3 py-1.5"
                    style={{ borderBottom: '1px solid oklch(0.17 0.010 264)' }}>
                    <span className="text-base shrink-0">{icon}</span>
                    <span className="text-xs" style={{ color: 'oklch(0.75 0.008 264)' }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom - The Gap reminder */}
          <div
            className="glass p-6 text-center"
            style={{ border: `1px solid ${GOLD}44`, background: `${GOLD}05` }}
          >
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: MUTED }}>Remember why</p>
            <p className="text-2xl font-black text-white mt-2">
              Every day you don&apos;t build, the gap stays at{' '}
              <span style={{ color: GOLD }}>£{gap.toLocaleString()}/mo</span>
            </p>
            <p className="text-sm mt-2" style={{ color: MUTED }}>
              One income action per day. One new stream per quarter. The maths works in your favour.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
