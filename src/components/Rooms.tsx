import { m } from 'motion/react'
import { cases, dossier, resume, tools } from '../content'
import { useReducedMotion } from '../lib/motion'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const month = (ym: string | null) => (ym ? `${MONTHS[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}` : 'Present')
export const resumeUrl = `${import.meta.env.BASE_URL}${resume.resumeDownload}`

function RoomHeading({ id, kicker, title, children }: { id: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <>
      <p className="font-type text-sm tracking-[0.3em] text-lamp-dim uppercase">{kicker}</p>
      <h2 id={`${id}-h`} className="mt-2 font-display text-4xl tracking-wide text-paper uppercase md:text-5xl">
        {title}
      </h2>
      {children && <p className="mt-3 max-w-prose text-asphalt-300">{children}</p>}
    </>
  )
}

const room = 'scroll-mt-14 px-4 py-20 md:px-8'

// Months between two YYYY-MM dates (end null = now), as "1 yr 3 mos".
function tenure(start: string, end: string | null) {
  const now = new Date()
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end ? end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
  const months = (ey - sy) * 12 + (em - sm) + 1
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}

// Highlighter on every figure in a bullet: 25%, 1,000+, 3x, 15K+, 91 …
function marked(text: string) {
  return text.split(/(\b\d[\d,.]*(?:%|x\b|K\+|\+)?)/).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="bg-transparent bg-[linear-gradient(transparent_55%,rgb(232_195_106/0.8)_55%)] px-0.5 font-semibold text-typed">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function Dossier() {
  return (
    <section id="dossier" aria-labelledby="dossier-h" className={room}>
      <div className="mx-auto max-w-6xl">
        <RoomHeading id="dossier" kicker="Personnel file · Parikh, A." title="The Dossier">
          Service record, newest first. Follow the thread.
        </RoomHeading>

        <ol className="relative mt-14">
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-3 w-0.5 bg-thread/80 md:left-1/2 md:-translate-x-1/2" />
          {dossier.serviceRecord.map((r, i) => {
            const right = i % 2 === 1
            return (
              <m.li
                key={r.fileNo}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative mb-14 grid pl-10 last:mb-0 md:grid-cols-2 md:gap-16 md:pl-0"
              >
                <span aria-hidden="true" className="absolute top-2 left-3 h-4 w-4 -translate-x-1/2 rounded-full bg-thread shadow-[0_0_0_4px_var(--color-asphalt-950)] md:left-1/2" />

                {/* Dates sit across the thread from the card. */}
                <div className={`mb-3 md:mb-0 md:pt-0.5 ${right ? 'md:text-right' : 'md:order-2'}`}>
                  <p className="font-display text-xl tracking-widest text-lamp uppercase">
                    {month(r.start)} – {month(r.end)}
                  </p>
                  <p className="font-type text-sm text-asphalt-300">
                    {tenure(r.start, r.end)} · {r.location}
                  </p>
                </div>

                <article className={`paper relative p-5 shadow-[0_10px_30px_rgb(0_0_0/0.5)] md:p-6 ${right ? 'md:rotate-1' : 'md:order-1 md:-rotate-1'}`}>
                  {!r.end && <span className="stamp absolute top-3 right-3 rotate-6 text-sm">Active</span>}
                  <p className="font-type text-xs tracking-widest text-typed/80 uppercase">File {r.fileNo}</p>
                  <h3 className="mt-1 pr-16 font-display text-2xl leading-tight tracking-wide uppercase">{r.company}</h3>
                  <p className="font-semibold">{r.role}</p>
                  <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-thread" />
                        <span>{marked(b)}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-dashed border-typed/30 pt-3" aria-label="Stack">
                    {r.stack.map((t) => (
                      <li key={t} className="border border-typed/40 px-1.5 py-0.5 font-type text-xs">
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </m.li>
            )
          })}
        </ol>

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl tracking-widest text-paper uppercase">Training</h3>
            <ul className="mt-5 space-y-5">
              {dossier.training.map((t) => (
                <li key={t.school} className="paper relative flex items-center gap-5 p-5 shadow-lg">
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-double border-thread text-center font-display leading-none text-thread">
                    <span>
                      <span className="block text-[10px] tracking-widest">GPA</span>
                      <span className="text-xl">{t.gpa.split(' ')[0]}</span>
                    </span>
                  </span>
                  <span>
                    <span className="block font-display text-lg leading-tight tracking-wide uppercase">{t.school}</span>
                    <span className="block">{t.degree}</span>
                    <span className="block font-type text-sm text-typed/80">
                      {month(t.start)} – {month(t.end)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-2xl tracking-widest text-paper uppercase">Commendations</h3>
            <ul className="mt-5 space-y-5">
              {dossier.commendations.map((c) => (
                <li key={c.text} className="paper relative p-5 pl-16 shadow-lg">
                  <span aria-hidden="true" className="absolute top-0 left-5 h-14 w-7 bg-[repeating-linear-gradient(90deg,#b3202a_0_7px,#e8c36a_7px_14px)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
                  <p className="font-type text-xs tracking-widest text-typed/80 uppercase">
                    {c.category} · {c.date.length === 7 ? month(c.date) : c.date}
                  </p>
                  <p className="mt-1 leading-relaxed">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Tools() {
  return (
    <section id="tools" aria-labelledby="tools-h" className={room}>
      <div className="mx-auto max-w-6xl">
        <RoomHeading id="tools" kicker="Kept within reach" title="The Locked Drawer">
          Grouped by kind. The dots show how many roles and projects each tool turns up in.
        </RoomHeading>
        <div className="mt-10 grid gap-6 border-[12px] border-[#2a1d14] bg-asphalt-800 p-5 shadow-[inset_0_10px_40px_rgb(0_0_0/0.7)] sm:grid-cols-2 md:p-8 lg:grid-cols-4">
          {tools.categories.map((cat, i) => (
            <div key={cat.name} className={`paper p-4 shadow-lg ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
              <h3 className="border-b border-typed/30 pb-2 font-display tracking-widest uppercase">{cat.name}</h3>
              <ul className="mt-3 space-y-1.5">
                {cat.items.map((t) => (
                  <li key={t.name} className="flex items-center justify-between gap-3 text-sm">
                    <span>{t.name}</span>
                    <span aria-label={`seen in ${t.weight} ${t.weight === 1 ? 'place' : 'places'}`} title={t.usedIn.join(', ')} className="shrink-0 font-type text-xs tracking-tighter text-thread">
                      {'●'.repeat(t.level)}
                      <span className="text-typed/25">{'●'.repeat(3 - t.level)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ColdCases() {
  const files = cases.coldCases.filter((c) => !c.oneLiner.startsWith('TODO'))
  return (
    <section id="cold-cases" aria-labelledby="cold-cases-h" className={room}>
      <div className="mx-auto max-w-5xl">
        <RoomHeading id="cold-cases" kicker="Filing cabinet, bottom drawer" title="Cold Cases">
          Earlier and smaller work. Each one is on GitHub.
        </RoomHeading>
        <div className="mt-10 rounded-sm bg-gradient-to-b from-asphalt-700 to-asphalt-800 p-3 shadow-2xl md:p-5">
          <div className="mx-auto mb-4 w-40 border border-asphalt-500 bg-paper py-1 text-center font-type text-xs tracking-widest text-typed uppercase">Cold cases</div>
          <ul className="space-y-2 bg-asphalt-950 p-2 md:p-4">
            {files.map((f) => (
              <li key={f.repo}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="manila group grid gap-1 rounded-t-sm px-4 py-3 transition hover:-translate-y-1 md:grid-cols-[200px_1fr_auto] md:items-center md:gap-6"
                >
                  <span className="font-display tracking-wide uppercase">{f.title}</span>
                  <span className="text-sm">
                    {f.oneLiner}
                    <span className="mt-1 block font-type text-xs text-typed/80">{f.stack.join(' · ')}</span>
                  </span>
                  <span className="font-type text-xs whitespace-nowrap">
                    {month(f.date)} <span aria-hidden="true">↗</span>
                    <span className="sr-only">(opens GitHub)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Tip() {
  const reduced = useReducedMotion()
  const { email, linkedin, github } = resume.contact
  const link = 'underline decoration-thread decoration-2 underline-offset-4 hover:text-thread'
  return (
    <section id="tip" aria-labelledby="tip-h" className={`${room} pb-0`}>
      <div className="mx-auto max-w-3xl text-center">
        <RoomHeading id="tip" kicker="Under the door" title="Leave a Tip" />
      </div>
      <div className="relative mx-auto mt-10 max-w-3xl">
        <m.div
          initial={reduced ? false : { y: 60, rotate: 0 }}
          whileInView={{ y: 0, rotate: -2 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="paper relative z-0 mx-auto max-w-lg p-6 pb-14 font-type shadow-2xl md:p-8 md:pb-14"
        >
          <p className="text-lg">Got a case that needs cracking? Slip a note under the door.</p>
          <dl className="mt-6 space-y-3 text-left">
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-typed/80">Email</dt>
              <dd><a className={link} href={`mailto:${email}`}>{email}</a></dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-typed/80">LinkedIn</dt>
              <dd><a className={link} href={linkedin} target="_blank" rel="noreferrer">{linkedin.replace('https://', '')}</a></dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-typed/80">GitHub</dt>
              <dd><a className={link} href={github} target="_blank" rel="noreferrer">{github.replace('https://', '')}</a></dd>
            </div>
            {resume.location.publish && (
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-typed/80">Location</dt>
                <dd>{resume.location.value}</dd>
              </div>
            )}
          </dl>
          <a href={resumeUrl} download className="mt-8 inline-block bg-typed px-5 py-2.5 font-display tracking-widest text-paper uppercase hover:bg-ink">
            Download the resume (PDF)
          </a>
        </m.div>
        {/* The door's bottom edge, which the note slides out from under. */}
        <div aria-hidden="true" className="relative z-10 -mt-6 h-24 bg-gradient-to-b from-[#3a2616] to-[#24170d] shadow-[0_-8px_20px_rgb(0_0_0/0.6)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-lamp/20" />
        </div>
      </div>
      <footer className="mx-auto max-w-5xl py-10 text-center font-type text-xs text-asphalt-300">
        Ashport is a made-up city. Every case is real. Built with React, Tailwind and canvas rain.
      </footer>
    </section>
  )
}
