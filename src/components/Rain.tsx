import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/motion'

type Drop = { x: number; y: number; len: number; speed: number; alpha: number }

/** Rain streaks on a canvas that fills its parent. Pauses off-screen, in hidden tabs, and under reduced motion. */
export default function Rain({ density = 0.00025, slant = 0.12 }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')!
    let drops: Drop[] = []
    let w = 0
    let h = 0
    let raf = 0
    let visible = true

    const spawn = (y = Math.random() * h): Drop => ({
      x: Math.random() * (w + h * slant),
      y,
      len: 10 + Math.random() * 18,
      speed: 7 + Math.random() * 9,
      alpha: 0.12 + Math.random() * 0.3,
    })

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drops = Array.from({ length: Math.round(w * h * density) }, () => spawn())
    }

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 1
      for (const d of drops) {
        ctx.strokeStyle = `rgba(200,205,215,${d.alpha})`
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - d.len * slant, d.y + d.len)
        ctx.stroke()
        d.y += d.speed
        d.x -= d.speed * slant
        if (d.y > h) Object.assign(d, spawn(-d.len))
      }
      raf = requestAnimationFrame(frame)
    }

    const sync = () => {
      cancelAnimationFrame(raf)
      if (visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    resize()
    sync()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reduced, density, slant])

  if (reduced) return null
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
}
