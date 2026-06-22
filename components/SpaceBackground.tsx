'use client'

import { useEffect, useRef } from 'react'

const NUM_STARS = 220
const SPEED = 0.4

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
      ctx.fillStyle = 'rgba(0,1,12,0.18)'
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
        const alpha = Math.min(1, t * 1.6)
        const w = Math.max(0.4, t * 2.2)

        ctx.beginPath()
        ctx.moveTo(prev.sx, prev.sy)
        ctx.lineTo(cur.sx, cur.sy)
        ctx.lineWidth = w
        ctx.strokeStyle = `rgba(${Math.floor(160 + t * 80)},${Math.floor(190 + t * 60)},255,${alpha * 0.85})`
        ctx.stroke()
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

      {/* Planet — massive glowing orb upper right */}
      <div style={{
        position: 'fixed', top: '-25vh', right: '-15vw',
        width: '70vw', height: '70vw', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, rgba(20,140,255,0.18) 0%, rgba(40,20,180,0.10) 35%, rgba(10,0,80,0.06) 65%, transparent 100%)',
        filter: 'blur(55px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Planet hard edge ring — faint */}
      <div style={{
        position: 'fixed', top: '-22vh', right: '-12vw',
        width: '64vw', height: '64vw', borderRadius: '50%',
        border: '1px solid rgba(60,160,255,0.06)',
        boxShadow: 'inset 0 0 80px rgba(30,80,255,0.05)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Nebula left — purple */}
      <div style={{
        position: 'fixed', top: '15vh', left: '-20vw',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,20,200,0.07) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Horizon glow — centre bottom */}
      <div style={{
        position: 'fixed', bottom: '-5vh', left: '20%', right: '20%',
        height: '30vh', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,100,255,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)', zIndex: 1, pointerEvents: 'none',
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
