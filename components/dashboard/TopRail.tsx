'use client'

import { useState, useEffect } from 'react'

export function TopRail() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 backdrop-blur-xl"
      style={{ borderBottom: '1px solid oklch(0.22 0.018 264 / 0.8)', background: 'oklch(0.08 0.015 264 / 0.85)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'oklch(0.65 0.20 250)', boxShadow: '0 0 10px oklch(0.65 0.20 250)' }} />
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: 'oklch(0.65 0.20 250)' }}>
          Solo Life OS
        </span>
      </div>

      <div className="text-right">
        <p className="mono text-sm font-semibold text-white/80">{time}</p>
        <p className="text-xs" style={{ color: 'oklch(0.45 0.010 264)' }}>{date}</p>
      </div>
    </header>
  )
}
