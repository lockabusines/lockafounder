'use client'

import { useEffect, useRef } from 'react'

const NUM_STARS = 280
const SPEED = 2.2

interface Star { x: number; y: number; z: number }

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * W * 3,
      y: (Math.random() - 0.5) * H * 3,
      z: Math.random() * W,
    }))

    function px(star: Star) {
      const fov = W * 0.5
      return { sx: (star.x / star.z) * fov + W / 2, sy: (star.y / star.z) * fov + H / 2 }
    }

    let raf: number
    function draw() {
      ctx.fillStyle = 'rgba(0,1,12,0.12)'
      ctx.fillRect(0, 0, W, H)

      for (const s of stars) {
        const prev = px(s)
        s.z -= SPEED
        if (s.z <= 1) {
          s.x = (Math.random() - 0.5) * W * 3
          s.y = (Math.random() - 0.5) * H * 3
          s.z = W
          continue
        }
        const cur = px(s)
        const t = 1 - s.z / W
        const alpha = Math.min(1, t * 2.0)
        const w = Math.max(0.6, t * 3.5)

        ctx.beginPath()
        ctx.moveTo(prev.sx, prev.sy)
        ctx.lineTo(cur.sx, cur.sy)
        ctx.lineWidth = w
        ctx.strokeStyle = `rgba(${Math.floor(140 + t * 115)},${Math.floor(180 + t * 75)},255,${alpha})`
        ctx.stroke()

        // bright dot at head of fast stars
        if (t > 0.7) {
          ctx.beginPath()
          ctx.arc(cur.sx, cur.sy, w * 0.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${t * 0.9})`
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <>
      {/* Deep space base */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 60% 20%, #000d2e 0%, #00040f 50%, #000005 100%)',
      }} />

      {/* Star canvas */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, zIndex: 1,
        width: '100vw', height: '100vh', pointerEvents: 'none',
      }} />

      {/* Planet — dominant upper-right presence */}
      <div style={{
        position: 'fixed', top: '-30vh', right: '-18vw',
        width: '75vw', height: '75vw', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, rgba(0,160,255,0.35) 0%, rgba(20,60,220,0.22) 30%, rgba(60,0,180,0.14) 55%, rgba(10,0,60,0.06) 75%, transparent 100%)',
        filter: 'blur(35px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Planet surface sheen */}
      <div style={{
        position: 'fixed', top: '-28vh', right: '-16vw',
        width: '70vw', height: '70vw', borderRadius: '50%',
        border: '1px solid rgba(0,180,255,0.18)',
        boxShadow: 'inset 0 0 120px rgba(0,100,255,0.12), 0 0 80px rgba(0,120,255,0.15)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Nebula left — purple, strong */}
      <div style={{
        position: 'fixed', top: '10vh', left: '-25vw',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,0,255,0.16) 0%, rgba(80,0,200,0.08) 50%, transparent 75%)',
        filter: 'blur(60px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Second nebula — bottom left, teal */}
      <div style={{
        position: 'fixed', bottom: '5vh', left: '5vw',
        width: '35vw', height: '35vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,180,0.10) 0%, transparent 70%)',
        filter: 'blur(50px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Horizon glow — strong */}
      <div style={{
        position: 'fixed', bottom: '-8vh', left: '10%', right: '10%',
        height: '35vh', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,120,255,0.16) 0%, rgba(0,60,200,0.08) 50%, transparent 80%)',
        filter: 'blur(30px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Perspective grid floor */}
      <div style={{
        position: 'fixed', bottom: 0, left: '-60%', right: '-60%', height: '48vh',
        backgroundImage: [
          'linear-gradient(to bottom, transparent 0%, rgba(0,1,15,0.97) 100%)',
          'linear-gradient(rgba(0,140,255,0.07) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(0,140,255,0.07) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '100% 100%, 90px 90px, 90px 90px',
        transform: 'perspective(280px) rotateX(82deg)',
        transformOrigin: 'center bottom',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Scan lines — very subtle */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.025) 0px,rgba(0,0,0,0.025) 1px,transparent 1px,transparent 5px)',
      }} />
    </>
  )
}
