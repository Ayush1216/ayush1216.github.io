import { useEffect, useState, useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
  )
}

/**
 * Types `text` one character at a time after `delay` ms. Shows nothing until `enabled`
 * (so typewriters can be chained), and everything at once under reduced motion.
 */
export function useTypewriter(text: string, { delay = 0, speed = 55, enabled = true } = {}) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)
  const instant = reduced

  useEffect(() => {
    if (instant || !enabled) return
    let id: number
    const start = setTimeout(() => {
      id = window.setInterval(() => {
        setCount((c) => {
          if (c >= text.length) clearInterval(id)
          return Math.min(c + 1, text.length)
        })
      }, speed)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(id)
    }
  }, [text, delay, speed, instant, enabled])

  const shown = instant ? text.length : count
  return { typed: text.slice(0, shown), done: shown >= text.length }
}
