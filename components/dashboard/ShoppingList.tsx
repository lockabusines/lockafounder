'use client'

import { useState, useMemo } from 'react'
import {
  SHOP_ITEMS, SHOP_CATEGORIES, SHOP_TARGET_LOW, SHOP_TARGET_HIGH,
  type ShopCategory,
} from '@/lib/shopping'

const RED    = 'oklch(0.58 0.22 25)'
const GOLD   = 'oklch(0.78 0.18 80)'
const GREEN  = 'oklch(0.68 0.18 145)'
const BLUE   = 'oklch(0.65 0.20 250)'
const MUTED  = 'oklch(0.40 0.008 264)'
const DIM    = 'oklch(0.22 0.015 264)'

const CAT_COLOR: Record<ShopCategory, string> = {
  'Protein':          GREEN,
  'Carbs & Grains':   BLUE,
  'Dairy & Fats':     GOLD,
  'Veg & Fruit':      'oklch(0.68 0.18 145)',
  'Flavour & Basics': MUTED,
}

export function ShoppingList() {
  const [open, setOpen] = useState(false)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<ShopCategory>('Protein')

  function toggle(id: string) {
    setTicked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function resetList() { setTicked(new Set()) }

  const totalCost = useMemo(
    () => SHOP_ITEMS.reduce((sum, i) => sum + i.price, 0),
    [],
  )
  const tickedCost = useMemo(
    () => SHOP_ITEMS.filter(i => ticked.has(i.id)).reduce((sum, i) => sum + i.price, 0),
    [ticked],
  )

  const tabItems = SHOP_ITEMS.filter(i => i.category === activeTab)
  const tabTicked = tabItems.filter(i => ticked.has(i.id)).length

  // ── Collapsed ────────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div className="glass p-4 flex items-center justify-between gap-4">
        <div>
          <p className="label">Weekly Shop</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            {ticked.size}/{SHOP_ITEMS.length} items · £{tickedCost.toFixed(2)} / £{totalCost.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: GREEN + '22', color: GREEN, border: `1px solid ${GREEN}44` }}
        >
          Shop List
        </button>
      </div>
    )
  }

  // ── Expanded ─────────────────────────────────────────────────────────────
  return (
    <div className="glass flex flex-col gap-0 overflow-hidden" style={{ border: `1px solid ${GREEN}33` }}>

      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4"
        style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}
      >
        <div>
          <p className="text-sm font-bold tracking-wider uppercase" style={{ color: GREEN }}>
            Fight Club Diet — Weekly Shop
          </p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            Target: £{SHOP_TARGET_LOW}–£{SHOP_TARGET_HIGH} / week · Aldi / Lidl / Tesco Basics
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ background: DIM, color: MUTED }}
        >✕</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-px" style={{ background: 'oklch(0.20 0.015 264)' }}>
        {[
          { label: 'Daily calories', value: '~3,000' },
          { label: 'Daily protein',  value: '~200g'  },
          { label: 'Est. total',     value: `£${totalCost.toFixed(2)}`, color: totalCost > SHOP_TARGET_HIGH ? RED : GREEN },
          { label: 'Items ticked',   value: `${ticked.size} / ${SHOP_ITEMS.length}` },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-0.5 px-4 py-3" style={{ background: 'oklch(0.11 0.015 264)' }}>
            <p className="label" style={{ fontSize: '0.58rem' }}>{label}</p>
            <p className="mono text-sm font-bold" style={{ color: color ?? 'white' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: `1px solid oklch(0.20 0.015 264)` }}>
        {SHOP_CATEGORIES.map(cat => {
          const items = SHOP_ITEMS.filter(i => i.category === cat)
          const done  = items.filter(i => ticked.has(i.id)).length
          const active = activeTab === cat
          const color  = CAT_COLOR[cat]
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                color: active ? color : MUTED,
                borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                background: active ? 'oklch(0.14 0.015 264)' : 'transparent',
              }}
            >
              {cat}
              {done > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: color + '33', color }}>
                  {done}/{items.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Item list */}
      <div className="flex flex-col divide-y max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin', borderColor: 'oklch(0.17 0.012 264)' }}>
        {tabItems.map(item => {
          const done = ticked.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-all w-full"
              style={{ background: done ? 'oklch(0.68 0.18 145 / 0.06)' : 'transparent' }}
            >
              {/* Checkbox */}
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: done ? GREEN : 'transparent',
                  border: `1.5px solid ${done ? GREEN : 'oklch(0.30 0.010 264)'}`,
                }}
              >
                {done && <span className="text-[10px] text-white font-bold">✓</span>}
              </div>

              {/* Name + note */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: done ? MUTED : 'oklch(0.88 0.008 264)', textDecoration: done ? 'line-through' : 'none' }}
                >
                  {item.name}
                </p>
                {item.note && (
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: 'oklch(0.32 0.008 264)' }}>{item.note}</p>
                )}
              </div>

              {/* Qty + price */}
              <div className="text-right shrink-0">
                <p className="text-xs font-mono" style={{ color: MUTED }}>{item.qty}</p>
                <p className="text-sm font-bold mono" style={{ color: done ? MUTED : GOLD }}>£{item.price.toFixed(2)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: `1px solid oklch(0.20 0.015 264)`, background: 'oklch(0.10 0.012 264 / 0.6)' }}
      >
        <div>
          <p className="text-xs" style={{ color: MUTED }}>
            Prices are Aldi / Lidl / Tesco basics estimates.
          </p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            Chicken thighs, eggs, oats + tinned fish — cheapest protein per gram in the UK.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <div className="text-right">
            <p className="label" style={{ fontSize: '0.6rem' }}>Estimated total</p>
            <p className="mono text-lg font-bold" style={{ color: totalCost > SHOP_TARGET_HIGH ? RED : GREEN }}>
              £{totalCost.toFixed(2)}
            </p>
          </div>
          {ticked.size > 0 && (
            <button
              onClick={resetList}
              className="px-3 py-1.5 rounded-lg text-xs font-medium ml-2"
              style={{ background: DIM, color: MUTED }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
