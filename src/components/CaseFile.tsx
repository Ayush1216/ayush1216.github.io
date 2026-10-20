import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { m } from 'motion/react'
import { cases } from '../content'
import { useReducedMotion } from '../lib/motion'
import { month } from './Rooms'

const featured = cases.featured
const sections = ['The Problem', 'Investigation', 'Evidence', 'Verdict'] as const

export default function CaseFile() {
  const { num } = useParams()
  const index = featured.findIndex((c) => c.caseNumber === num)
  if (index < 0) return <Navigate to="/" replace />
  // Keyed so tab state resets when moving to another case.
  return <Folder key={num} index={index} />
}

function Folder({ index }: { index: number }) {
  const c = featured[index]
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [tab, setTab] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    document.title = `Case #${c.caseNumber}: ${c.codename} · Ayush Parikh`
    heading.current?.focus()
    window.scrollTo(0, 0)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && navigate('/#corkboard')
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [c, navigate])

  const prev = featured[(index - 1 + featured.length) % featured.length]
  const next = featured[(index + 1) % featured.length]
  const dates = c.dateOpened
    ? `${month(c.dateOpened)}${c.dateClosed && c.dateClosed !== c.dateOpened ? ` to ${month(c.dateClosed)}` : ''}`
    : 'context' in c ? c.context : ''

  const onTabKey = (e: React.KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    const n = (tab + dir + sections.length) % sections.length
    setTab(n)
    tabs.current[n]?.focus()
  }

  return (
    <main id="content" className="min-h-svh bg-asphalt-950 px-0 pt-14 pb-16 md:px-8 md:pt-24">
      <m.article
        key={c.caseNumber}
        initial={reduced ? false : { y: 80, opacity: 0, rotate: -1.5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative mx-auto max-w-4xl"
      >
        {/* Folder tabs */}
        <div role="tablist" aria-label="Case sections" className="flex gap-1 overflow-x-auto px-2 md:px-6" onKeyDown={onTabKey}>
          {sections.map((s, i) => (
            <button
              key={s}
              ref={(el) => {
                tabs.current[i] = el
              }}
              role="tab"
              id={`tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`panel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              className={`manila shrink-0 rounded-t-md px-4 py-2 font-display text-sm tracking-widest uppercase transition ${
                tab === i ? 'translate-y-px pb-3' : 'mt-1 opacity-55 hover:opacity-85'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="manila relative min-h-[70svh] overflow-hidden p-5 shadow-[0_20px_60px_rgb(0_0_0/0.7)] md:rounded-sm md:p-10">
          <div aria-hidden="true" className="coffee-ring absolute -right-10 -bottom-10 h-48 w-48 opacity-60" />
          <header className="relative border-b-2 border-typed/30 pt-14 pb-5 md:pt-0 md:pr-48">
            <p className="font-type text-sm tracking-widest uppercase">
              Case #{c.caseNumber} · {c.status} {dates && <>· {dates}</>}
            </p>
            <h1 ref={heading} tabIndex={-1} className="mt-2 font-display text-3xl leading-tight tracking-wide uppercase outline-none md:text-5xl">
              {c.codename}
            </h1>
            <p className="mt-3 text-xl font-semibold">{c.realTitle}</p>
            <p className="mt-2 max-w-prose text-lg">{c.oneLiner}</p>
            <m.span
              aria-hidden="true"
              initial={reduced ? false : { scale: 2.4, opacity: 0, rotate: -24 }}
              animate={{ scale: 1, opacity: 0.85, rotate: -12 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 500, damping: 18 }}
              className="stamp absolute top-3 right-1 text-xl md:top-2 md:right-0 md:text-4xl"
            >
              {c.status}
            </m.span>
          </header>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="relative mt-6 outline-none">
            {tab === 0 && <p className="max-w-prose text-lg leading-relaxed">{c.theProblem}</p>}
            {tab === 1 && (
              <ol className="max-w-prose space-y-4">
                {c.investigation.map((step, i) => (
                  <li key={i} className="flex gap-4 text-lg leading-relaxed">
                    <span className="font-type text-sm text-typed/80">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {tab === 2 && <Evidence c={c} />}
            {tab === 3 && (
              <ul className="max-w-prose space-y-4">
                {c.verdict.map((v, i) => (
                  <li key={i} className="border-l-4 border-thread/70 pl-4 text-lg leading-relaxed">
                    {v}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <nav aria-label="Other cases" className="mt-6 flex flex-wrap items-center justify-between gap-4 px-4 font-display text-sm tracking-widest uppercase md:px-0">
          <Link to={`/case/${prev.caseNumber}`} className="text-asphalt-100 hover:text-lamp">
            ← #{prev.caseNumber} {prev.codename}
          </Link>
          <Link to="/#corkboard" className="text-lamp hover:text-paper">
            Back to the board
          </Link>
          <Link to={`/case/${next.caseNumber}`} className="text-asphalt-100 hover:text-lamp">
            #{next.caseNumber} {next.codename} →
          </Link>
        </nav>
      </m.article>
    </main>
  )
}

const exhibit = 'font-type text-sm tracking-widest uppercase'
const langColors = ['#2a2622', '#b3202a', '#8a6a3a', '#5a5f68', '#c9a65a']

function Evidence({ c }: { c: (typeof featured)[number] }) {
  const { stack, links, screenshots, flow, flowSource } = c.evidence
  const languages = 'languages' in c.evidence && (c.evidence.languages?.length ?? 0) > 1 ? c.evidence.languages : null
  return (
    <div className="space-y-12">
      <section aria-labelledby="ex-flow">
        <h2 id="ex-flow" className={exhibit}>Exhibit A · How it fits together</h2>
        <ol className="mt-5 grid gap-8 md:grid-flow-col md:auto-cols-fr md:gap-6">
          {flow.map((step, i) => (
            <li key={step.label} className="relative">
              <div className={`paper h-full p-3 shadow-md ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <p className="font-type text-xs">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-1 font-display text-base leading-tight tracking-wide uppercase">{step.label}</p>
                <p className="mt-2 text-sm leading-snug">{step.detail}</p>
              </div>
              {'note' in step && <p className="mt-2 font-type text-xs text-thread">{step.note}</p>}
              {i < flow.length - 1 && (
                <span aria-hidden="true" className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xl text-thread md:top-1/2 md:-right-5 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 font-type text-xs text-typed/80">Source: {flowSource}</p>
      </section>

      <section aria-labelledby="ex-stack">
        <h2 id="ex-stack" className={exhibit}>Exhibit B · Stack</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {stack.map((s) => (
            <li key={s} className="-rotate-1 border-2 border-typed/70 px-2 py-0.5 font-display text-sm tracking-wider uppercase">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-4">
          {links.live && (
            <a href={links.live} target="_blank" rel="noreferrer" className="bg-typed px-5 py-2.5 font-display tracking-widest text-paper uppercase hover:bg-ink">
              Live demo ↗
            </a>
          )}
          {links.repo ? (
            <a href={links.repo} target="_blank" rel="noreferrer" className="border-2 border-typed px-5 py-2.5 font-display tracking-widest uppercase hover:bg-typed hover:text-paper">
              Source on GitHub ↗
            </a>
          ) : (
            <p className="font-type text-sm text-typed/80">No public repository for this case.</p>
          )}
        </div>
      </section>

      {languages && (
        <section aria-labelledby="ex-lang">
          <h2 id="ex-lang" className={exhibit}>Exhibit C · Fingerprints</h2>
          <p className="mt-2 text-sm">Language breakdown of the repository, by bytes of code, from GitHub.</p>
          <div className="mt-3 flex h-4 overflow-hidden border border-typed/40" aria-hidden="true">
            {languages.map((l, i) => (
              <span key={l.name} style={{ width: `${l.percent}%`, background: langColors[i % langColors.length] }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-type text-sm">
            {languages.map((l, i) => (
              <li key={l.name} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-3" style={{ background: langColors[i % langColors.length] }} />
                {l.name} {l.percent}%
              </li>
            ))}
          </ul>
        </section>
      )}

      {screenshots.length > 0 && (
        <section aria-labelledby="ex-photos">
          <h2 id="ex-photos" className={exhibit}>Photographs</h2>
          <div className="mt-5 grid gap-8 sm:grid-cols-2">
            {screenshots.map((s, i) => (
              <figure key={s.src} className={`evidence-photo relative ${i % 2 ? 'rotate-2' : '-rotate-2'}`}>
                <span aria-hidden="true" className="absolute -top-3 left-6 h-8 w-3 rounded-full border-2 border-asphalt-500" />
                <img src={s.src} alt={s.alt} loading="lazy" decoding="async" className="evidence-film w-full" />
                <figcaption className="absolute bottom-1.5 left-3 font-type text-xs text-typed">Photo {i + 1}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
