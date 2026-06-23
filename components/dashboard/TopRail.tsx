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
      setDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-2.5"
      style={{
        background: '#0e0e0f',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Left — nav */}
      <div className="flex items-center gap-1" style={{ fontFamily: 'var(--font-geist-sans)', fontSize: '0.7rem' }}>
        <div className="flex items-center gap-2 mr-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1aff8c' }} />
          <span className="font-semibold tracking-wider uppercase" style={{ color: '#f0f0f0', letterSpacing: '0.12em', fontSize: '0.65rem' }}>
            Solo Life OS
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <Link href="/" className="px-2 py-1 rounded transition-colors hover:bg-white/5">
          <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>Dashboard</span>
        </Link>
        <Link href="/mission" className="px-2 py-1 rounded transition-colors hover:bg-white/5">
          <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>Mission</span>
        </Link>
        <Link href="/crm" className="px-2 py-1 rounded transition-colors hover:bg-white/5">
          <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>CRM</span>
        </Link>
        <Link href="/calendar" className="px-2 py-1 rounded transition-colors hover:bg-white/5">
          <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>Calendar</span>
        </Link>
        <Link href="/expenses" className="px-2 py-1 rounded transition-colors hover:bg-white/5">
          <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>Expenses</span>
        </Link>
      </div>

      {/* Right — clock */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          {['SYS', 'DB', 'BOT'].map((sys, i) => (
            <div key={sys} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: i === 2 ? '#1aff8c' : 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>{sys}</span>
            </div>
          ))}
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold" style={{ fontSize: '0.8rem', color: '#f0f0f0', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono)' }}>
            {time}
          </p>
          <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono)' }}>
            {date}
          </p>
        </div>
      </div>
    </header>
  )
}
