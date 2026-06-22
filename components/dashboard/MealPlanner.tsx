'use client'

import { useState, useCallback } from 'react'
import {
  MEALS, CATEGORIES, TARGETS, generateRandomPlan, sumMacros,
  type Meal, type MealCategory,
} from '@/lib/meals'

// ── Design tokens — Fight Club red accent on top of existing dark theme ──────
const RED   = 'oklch(0.58 0.22 25)'
const RED_D = 'oklch(0.42 0.18 25)'
const GOLD  = 'oklch(0.78 0.18 80)'
const GREEN = 'oklch(0.68 0.18 145)'
const BLUE  = 'oklch(0.65 0.20 250)'
const MUTED = 'oklch(0.40 0.008 264)'
const DIM   = 'oklch(0.25 0.012 264)'

// ── Macro bar ────────────────────────────────────────────────────────────────
function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  const over = value > target
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="label">{label}</span>
        <span className="mono text-xs" style={{ color: over ? RED : color }}>
          {value}<span style={{ color: MUTED }}>/{target}{label === 'KCAL' ? '' : 'g'}</span>
        </span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{
            width: `${pct}%`,
            background: over
              ? `linear-gradient(90deg, ${RED_D}, ${RED})`
              : `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}

// ── Single meal row ───────────────────────────────────────────────────────────
function MealRow({ meal, selected, onToggle }: { meal: Meal; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all"
      style={{
        background: selected ? 'oklch(0.58 0.22 25 / 0.12)' : 'transparent',
        border: `1px solid ${selected ? RED + '55' : 'transparent'}`,
      }}
    >
      {/* Checkbox */}
      <div
        className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
        style={{
          background: selected ? RED : 'transparent',
          border: `1.5px solid ${selected ? RED : 'oklch(0.32 0.010 264)'}`,
        }}
      >
        {selected && <span className="text-[9px] text-white font-bold">✓</span>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 leading-snug">{meal.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{meal.notes}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="mono text-[10px]" style={{ color: GOLD }}>{meal.calories} kcal</span>
          <span className="mono text-[10px]" style={{ color: GREEN }}>P {meal.protein}g</span>
          <span className="mono text-[10px]" style={{ color: BLUE }}>C {meal.carbs}g</span>
          <span className="mono text-[10px]" style={{ color: RED }}>F {meal.fat}g</span>
          <span className="text-[10px]" style={{ color: DIM }}>~{meal.prepMins}m</span>
        </div>
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function MealPlanner() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<MealCategory>('Breakfast')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [exported, setExported] = useState(false)

  const selectedMeals = MEALS.filter(m => selected.has(m.id))
  const totals = sumMacros(selectedMeals)
  const nearTarget = Math.abs(totals.calories - TARGETS.calories) <= 100 && totals.calories > 0

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  function randomDay() {
    const plan = generateRandomPlan()
    setSelected(new Set(plan.map(m => m.id)))
    setTab('Breakfast')
  }

  function clearPlan() {
    setSelected(new Set())
  }

  function exportPlan() {
    if (selectedMeals.length === 0) return
    const lines: string[] = [
      '# Fight Club Diet — Daily Plan',
      `Date: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
      '',
      `## Totals: ${totals.calories} kcal | P ${totals.protein}g | C ${totals.carbs}g | F ${totals.fat}g`,
      `## Targets: ${TARGETS.calories} kcal | P ${TARGETS.protein}g | C ${TARGETS.carbs}g | F ${TARGETS.fat}g`,
      '',
    ]
    for (const cat of CATEGORIES) {
      const meals = selectedMeals.filter(m => m.category === cat)
      if (meals.length === 0) continue
      lines.push(`## ${cat}`)
      for (const m of meals) {
        lines.push(`- ${m.name} — ${m.calories} kcal | P ${m.protein}g | C ${m.carbs}g | F ${m.fat}g | ~${m.prepMins}m`)
        lines.push(`  ${m.notes}`)
      }
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fight-club-diet-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(a.href)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  // ── Collapsed state ────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div className="glass p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Fight Club Diet</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>3,000 kcal · 200g protein</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: RED + '22', color: RED, border: `1px solid ${RED}44` }}
          >
            Plan Today
          </button>
        </div>

        {/* Mini macros summary */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'KCAL', value: totals.calories, target: TARGETS.calories, color: GOLD },
            { label: 'PROT', value: totals.protein,  target: TARGETS.protein,  color: GREEN },
            { label: 'CARB', value: totals.carbs,    target: TARGETS.carbs,    color: BLUE },
            { label: 'FAT',  value: totals.fat,       target: TARGETS.fat,      color: RED },
          ].map(({ label, value, target, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 py-2 rounded-lg" style={{ background: 'oklch(0.13 0.015 264)' }}>
              <span className="mono text-base font-bold" style={{ color: value > 0 ? color : MUTED }}>
                {value > 0 ? value : '—'}
              </span>
              <span className="label" style={{ fontSize: '0.6rem' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Expanded planner ───────────────────────────────────────────────────────
  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ border: `1px solid ${RED}33` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid oklch(0.22 0.018 264)` }}>
        <div>
          <p className="text-sm font-bold tracking-wider uppercase" style={{ color: RED }}>Fight Club Diet</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>Target: 3,000 kcal / P 200g / C 250g / F 80g</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={randomDay} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80" style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}44` }}>
            🎲 Random Day
          </button>
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70" style={{ background: 'oklch(0.18 0.015 264)', color: MUTED }}>
            ✕
          </button>
        </div>
      </div>

      {/* Macro bars */}
      <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3" style={{ background: 'oklch(0.10 0.012 264 / 0.6)' }}>
        <MacroBar label="KCAL"  value={totals.calories} target={TARGETS.calories} color={GOLD}  />
        <MacroBar label="PROT"  value={totals.protein}  target={TARGETS.protein}  color={GREEN} />
        <MacroBar label="CARBS" value={totals.carbs}    target={TARGETS.carbs}    color={BLUE}  />
        <MacroBar label="FAT"   value={totals.fat}       target={TARGETS.fat}      color={RED}   />
      </div>

      {/* Target hit alert */}
      {nearTarget && (
        <div className="mx-5 mb-0 mt-0 px-4 py-2 rounded-lg text-xs font-semibold text-center" style={{ background: GREEN + '22', color: GREEN, border: `1px solid ${GREEN}44` }}>
          ✓ On target — {totals.calories} kcal locked in
        </div>
      )}

      {/* Category tabs */}
      <div className="flex px-5 pt-4 gap-1" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}>
        {CATEGORIES.map(cat => {
          const count = MEALS.filter(m => m.category === cat && selected.has(m.id)).length
          const active = tab === cat
          return (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className="px-3 py-2 text-xs font-semibold rounded-t-lg transition-all relative"
              style={{
                color: active ? RED : MUTED,
                background: active ? 'oklch(0.14 0.018 264)' : 'transparent',
                borderBottom: active ? `2px solid ${RED}` : '2px solid transparent',
              }}
            >
              {cat}
              {count > 0 && (
                <span className="ml-1.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold" style={{ background: RED, color: 'white' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Meal list */}
      <div className="px-3 py-2 flex flex-col gap-0.5 max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {MEALS.filter(m => m.category === tab).map(meal => (
          <MealRow key={meal.id} meal={meal} selected={selected.has(meal.id)} onToggle={() => toggle(meal.id)} />
        ))}
      </div>

      {/* Selected summary + actions */}
      {selectedMeals.length > 0 && (
        <div className="px-5 py-4 flex flex-col gap-3" style={{ borderTop: `1px solid oklch(0.20 0.015 264)`, background: 'oklch(0.10 0.012 264 / 0.5)' }}>
          <div className="flex flex-wrap gap-2">
            {selectedMeals.map(m => (
              <span
                key={m.id}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                style={{ background: 'oklch(0.16 0.015 264)', color: 'oklch(0.70 0.008 264)' }}
              >
                {m.name.split(' ').slice(0, 3).join(' ')}
                <button onClick={() => toggle(m.id)} className="ml-1 hover:opacity-70" style={{ color: MUTED }}>✕</button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPlan}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: RED + '22', color: RED, border: `1px solid ${RED}44` }}
            >
              {exported ? '✓ Saved' : '↓ Export .md'}
            </button>
            <button
              onClick={clearPlan}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'oklch(0.16 0.015 264)', color: MUTED }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
