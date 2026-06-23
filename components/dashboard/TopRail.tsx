'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function TopRail() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        background: 'rgba(0, 6, 25, 0.92)',
        borderBottom: '1px solid rgba(0, 160, 255, 0.20)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 1px 0 rgba(0, 200, 255, 0.08), 0 4px 20px rgba(0, 0, 20, 0.6)',
      }}
    >
      {/* Left — brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full animate-pulse-glow"
          style={{ background: 'rgba(0, 220, 255, 1)', boxShadow: '0 0 8px rgba(0,220,255,0.9), 0 0 20px rgba(0,180,255,0.5)' }}
        />
        <span
          className="text-sm font-bold tracking-widest uppercase text-glow-cyan"
          style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(0, 220, 255, 0.95)', letterSpacing: '0.18em' }}
        >
          Solo Life OS
        </span>
        <span style={{ color: 'rgba(0, 140, 255, 0.3)', fontSize: '0.6rem', marginLeft: 4 }}>▸</span>
        <Link href="/mission">
          <span className="text-xs tracking-wider uppercase transition-all hover:opacity-80"
            style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(255,200,0,0.7)', letterSpacing: '0.12em' }}>
            Mission
          </span>
        </Link>
        <span style={{ color: 'rgba(0, 140, 255, 0.3)', fontSize: '0.6rem' }}>▸</span>
        <Link href="/crm">
          <span className="text-xs tracking-wider uppercase transition-all hover:opacity-80"
            style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(0,220,255,0.7)', letterSpacing: '0.12em' }}>
            CRM
          </span>
        </Link>
      </div>

      {/* Centre — status indicators */}
      <div className="hidden md:flex items-center gap-4">
        {['SYS', 'DB', 'BOT'].map((sys, i) => (
          <div key={sys} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: i === 2 ? 'rgba(0,255,120,1)' : 'rgba(0,220,255,1)',
              boxShadow: `0 0 6px ${i === 2 ? 'rgba(0,255,120,0.8)' : 'rgba(0,220,255,0.8)'}`,
            }} />
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: 'rgba(0, 160, 255, 0.6)', letterSpacing: '0.1em' }}>{sys}</span>
          </div>
        ))}
      </div>

      {/* Right — clock */}
      <div className="text-right">
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: 'Share Tech Mono, monospace', color: 'rgba(0, 220, 255, 0.9)', letterSpacing: '0.08em' }}
        >
          {time}
        </p>
        <p className="text-xs" style={{ color: 'rgba(0, 140, 255, 0.55)', letterSpacing: '0.05em', fontFamily: 'Share Tech Mono, monospace' }}>
          {date}
        </p>
      </div>
    </header>
  )
}
