import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { m, useInView } from 'motion/react'
import { cases } from '../content'
import { useReducedMotion } from '../lib/motion'

const featured = cases.featured
const tilt = [-2, 1.5, -1, 2.2, 1, -1.8, 2, -1.2]

// Tags sorted by how many cases use them, dealt alternately to the left and right columns.
const tags = (() => {
  const count = new Map<string, number>()
  featured.forEach((c) => c.boardTags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)))
  const sorted = [...count.keys()].sort((a, b) => count.get(b)! - count.get(a)!)
  return { left: sorted.filter((_, i) => i % 2 === 0), right: sorted.filter((_, i) => i % 2 === 1), all: sorted }
})()

type Point = { x: number; y: number }

export default function Corkboard() {
  const [hoverCase, setHoverCase] = useState<string | null>(null)
  const [hoverTag, setHoverTag] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const focusTag = hoverTag ?? (hoverCase ? null : filter)
  const activeCases = useMemo(() => {
    if (hoverCase) return new Set([hoverCase])
    if (focusTag) return new Set(featured.filter((c) => c.boardTags.includes(focusTag)).map((c) => c.caseNumber))
    return null // nothing singled out
  }, [hoverCase, focusTag])
  const activeTags = useMemo(() => {
    if (!activeCases) return null
    if (focusTag) return new Set([focusTag])
    return new Set(featured.filter((c) => activeCases.has(c.caseNumber)).flatMap((c) => c.boardTags))
  }, [activeCases, focusTag])

  const caseProps = (num: string) => ({
    onMouseEnter: () => setHoverCase(num),
    onMouseLeave: () => setHoverCase(null),
    onFocus: () => setHoverCase(num),
    onBlur: () => setHoverCase(null),
  })
  const tagButton = (t: string, extra = '') => (
    <button
      key={t}
      type="button"
      data-pin={`tag:${t}`}
      aria-pressed={filter === t}
      onClick={() => setFilter(filter === t ? null : t)}
      onMouseEnter={() => setHoverTag(t)}
      onMouseLeave={() => setHoverTag(null)}
      onFocus={() => setHoverTag(t)}
      onBlur={() => setHoverTag(null)}
      className={`paper relative border-t-4 px-3 py-2 text-left font-type text-sm shadow-md transition ${
        filter === t ? 'border-thread ring-2 ring-lamp' : 'border-thread/60'
      } ${activeTags && !activeTags.has(t) ? 'opacity-40' : ''} ${extra}`}
    >
      {t}
    </button>
  )

  return (
    <section id="corkboard" aria-labelledby="corkboard-h" className="scroll-mt-14 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-type text-sm tracking-[0.3em] text-lamp-dim uppercase">Exhibit board</p>
        <h2 id="corkboard-h" className="mt-2 font-display text-4xl tracking-wide text-paper uppercase md:text-5xl">
          The Corkboard
        </h2>
        <p className="mt-3 max-w-prose text-asphalt-300">
          Eight cases, all closed. Hover or tab to a case to follow its strings. Pick an index card to filter by tech.
        </p>
        {filter && (
          <p className="mt-4 font-type text-sm text-lamp" role="status">
            Showing cases tied to “{filter}”.{' '}
            <button type="button" onClick={() => setFilter(null)} className="underline underline-offset-4">
              Clear
            </button>
          </p>
        )}

        {/* Phones: a stack of cards with tag chips, no strings. */}
        <div className="mt-8 md:hidden">
          <div className="flex flex-wrap gap-2">{tags.all.map((t) => tagButton(t, 'py-1 text-xs'))}</div>
          <ul className="mt-8 space-y-6">
            {featured.map((c) => (
              <li key={c.caseNumber} className={activeCases && !activeCases.has(c.caseNumber) ? 'opacity-35' : ''}>
                <CaseCard c={c} />
                <p className="mt-2 font-type text-xs text-asphalt-300">{c.boardTags.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </div>

        <Board
          {...{ activeCases, activeTags, focusTag, caseProps, tagButton }}
        />
      </div>
    </section>
  )
}

type BoardProps = {
  activeCases: Set<string> | null
  activeTags: Set<string> | null
  focusTag: string | null
  caseProps: (num: string) => object
  tagButton: (t: string, extra?: string) => React.ReactNode
}

function Board({ activeCases, focusTag, caseProps, tagButton }: BoardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reduced = useReducedMotion()
  const [pins, setPins] = useState<Record<string, Point>>({})

  useLayoutEffect(() => {
    const board = ref.current!
    const measure = () => {
      const origin = board.getBoundingClientRect()
      const next: Record<string, Point> = {}
      board.querySelectorAll<HTMLElement>('[data-pin]').forEach((el) => {
        const r = el.getBoundingClientRect()
        const isTag = el.dataset.pin!.startsWith('tag:')
        const left = el.closest('[data-side="left"]')
        // Case pins sit at the top centre; tag pins on the edge facing the cases.
        next[el.dataset.pin!] = isTag
          ? { x: (left ? r.right : r.left) - origin.left, y: r.top + r.height / 2 - origin.top }
          : { x: r.left + r.width / 2 - origin.left, y: r.top + 6 - origin.top }
      })
      setPins(next)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(board) // fires once immediately, after layout
    return () => ro.disconnect()
  }, [])

  const strings = featured.flatMap((c) =>
    c.boardTags.map((t) => {
      const a = pins[`case:${c.caseNumber}`]
      const b = pins[`tag:${t}`]
      if (!a || !b) return null
      const sag = 30 + Math.abs(a.x - b.x) * 0.08
      const lit = activeCases ? activeCases.has(c.caseNumber) && (!focusTag || focusTag === t) : null
      return { key: `${c.caseNumber}-${t}`, d: `M${a.x},${a.y} Q${(a.x + b.x) / 2},${Math.max(a.y, b.y) + sag} ${b.x},${b.y}`, lit }
    }),
  )

  return (
    <div
      ref={ref}
      className="relative mt-10 hidden grid-cols-[150px_1fr_150px] gap-8 border-[14px] border-[#3a2616] bg-cork p-8 shadow-[inset_0_0_60px_rgb(0_0_0/0.6)] [background-image:var(--fibers)] md:grid lg:grid-cols-[170px_1fr_170px] lg:gap-12"
    >
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true">
        {strings.map(
          (s) =>
            s && (
              <m.path
                key={s.key}
                d={s.d}
                fill="none"
                stroke="#b3202a"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{
                  pathLength: inView || reduced ? 1 : 0,
                  opacity: s.lit === null ? 0.55 : s.lit ? 1 : 0.07,
                  strokeWidth: s.lit ? 2.5 : 1.5,
                }}
                transition={{ pathLength: { duration: 1.2, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
              />
            ),
        )}
      </svg>
      {/* Highlighted strings run over the cards so they can be followed end to end. */}
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
        {strings.map((s) => s?.lit && <path key={s.key} d={s.d} fill="none" stroke="#c9252f" strokeWidth="2.5" strokeLinecap="round" />)}
      </svg>

      <div data-side="left" className="relative z-10 flex flex-col justify-around gap-4">
        {tags.left.map((t) => tagButton(t))}
      </div>

      <ul className="relative z-10 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
        {featured.map((c, i) => (
          <li
            key={c.caseNumber}
            style={{ rotate: `${tilt[i % tilt.length]}deg` }}
            className={`transition-opacity duration-200 ${activeCases && !activeCases.has(c.caseNumber) ? 'opacity-35' : ''}`}
          >
            <CaseCard c={c} pin {...caseProps(c.caseNumber)} />
          </li>
        ))}
      </ul>

      <div data-side="right" className="relative z-10 flex flex-col justify-around gap-4">
        {tags.right.map((t) => tagButton(t))}
      </div>
    </div>
  )
}

function CaseCard({ c, pin, ...handlers }: { c: (typeof featured)[number]; pin?: boolean }) {
  return (
    <Link
      to={`/case/${c.caseNumber}`}
      data-pin={pin ? `case:${c.caseNumber}` : undefined}
      className="paper group relative block h-full p-4 pt-6 shadow-[0_8px_20px_rgb(0_0_0/0.45)] transition hover:-translate-y-1"
      {...handlers}
    >
      {pin && <span aria-hidden="true" className="absolute top-1 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-thread shadow-[0_2px_3px_rgb(0_0_0/0.5)]" />}
      <span className="font-type text-xs tracking-widest text-typed/80 uppercase">Case #{c.caseNumber}</span>
      <span className="mt-2 block font-display text-xl leading-tight tracking-wide text-typed uppercase">{c.codename}</span>
      <span className="mt-3 block border-t border-typed/20 pt-2 text-sm text-typed/80">{c.realTitle}</span>
    </Link>
  )
}
