import { resume } from '../content'
import { resumeUrl } from './Rooms'
import { useTypewriter } from '../lib/motion'
import Rain from './Rain'
import Skyline from './Skyline'

const LAMP_MS = 900

/** The landing scene: a dark office, rain on the window, a lamp that flickers on, a name typed out. */
export default function Office() {
  const name = useTypewriter(resume.name, { delay: LAMP_MS, speed: 60 })
  const title = useTypewriter(resume.headline, { enabled: name.done, speed: 18 })
  const ready = title.done

  return (
    <section aria-label="The office" className="relative isolate min-h-svh overflow-hidden bg-asphalt-950">
      {/* Window light through blinds, falling across the wall. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-60 [background:repeating-linear-gradient(-12deg,transparent_0_22px,rgb(170_180_200/0.07)_22px_34px)] [mask-image:linear-gradient(to_left,black,transparent_75%)]"
      />

      <div className="relative z-10 mx-auto grid min-h-svh max-w-6xl grid-rows-[auto_1fr] gap-8 px-4 pt-20 pb-40 md:grid-cols-[1.1fr_1fr] md:grid-rows-1 md:items-center md:gap-12 md:px-8 md:pt-0">
        {/* The window */}
        <div className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-sm border-[10px] border-asphalt-800 shadow-[0_0_80px_rgb(0_0_0/0.8)] md:order-last">
          <Skyline />
          <Rain />
          {/* Mullions and glass sheen */}
          <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-asphalt-800" />
          <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-asphalt-800" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        </div>

        {/* Under the lamp */}
        <div className="relative">
          <div aria-hidden="true" className="lamp-on pointer-events-none absolute -inset-24 -z-10 bg-[radial-gradient(closest-side,rgb(232_195_106/0.16),transparent)]" />
          <p className="font-type text-sm tracking-[0.3em] text-lamp-dim uppercase">Case Files · Ashport</p>

          <h1 className="mt-4 font-type text-5xl leading-tight text-paper sm:text-6xl">
            <span className="sr-only">{resume.name}</span>
            <span aria-hidden="true">
              {name.typed}
              {!name.done && <span className="caret">▌</span>}
            </span>
          </h1>
          <p className="mt-2 min-h-[1.75rem] font-display text-lg tracking-wider text-lamp uppercase sm:text-xl">
            <span className="sr-only">{resume.headline}</span>
            <span aria-hidden="true">
              {title.typed}
              {name.done && !title.done && <span className="caret">▌</span>}
            </span>
          </p>

          <div className={`transition-opacity duration-300 motion-reduce:transition-none ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-asphalt-100">
              It was raining in Ashport, like always. {resume.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#corkboard"
                tabIndex={ready ? 0 : -1}
                className="bg-lamp px-6 py-3 font-display tracking-widest text-ink uppercase transition hover:bg-paper"
              >
                Open the case files
              </a>
              <a
                href={resumeUrl}
                download
                tabIndex={ready ? 0 : -1}
                className="border border-asphalt-300 px-6 py-3 font-display tracking-widest text-asphalt-100 uppercase transition hover:border-lamp hover:text-lamp"
              >
                Download resume (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The desk and the lamp */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-[#2a1d14] to-[#140d09] shadow-[0_-12px_30px_rgb(0_0_0/0.6)]">
        <div className="coffee-ring absolute top-4 right-[22%] h-20 w-20 opacity-70" />
        <svg viewBox="0 0 200 240" className="absolute bottom-20 left-[1%] hidden h-44 lg:block xl:h-52">
          <defs>
            <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8c36a" stopOpacity="0.35" />
              <stop offset="1" stopColor="#e8c36a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="lamp-on" d="M150 92 L200 240 L70 240 Z" fill="url(#cone)" />
          <path d="M40 232h70" stroke="#0b0b0c" strokeWidth="12" strokeLinecap="round" />
          <path d="M75 228 L60 120 L125 60" stroke="#1d1d20" strokeWidth="8" fill="none" strokeLinejoin="round" />
          <circle cx="60" cy="120" r="7" fill="#26272b" />
          <path d="M110 30 L180 70 L155 100 L95 62Z" fill="#2a2b30" />
          <ellipse className="lamp-on" cx="167" cy="86" rx="16" ry="6" fill="#f3d488" transform="rotate(40 167 86)" />
        </svg>
      </div>
      <div aria-hidden="true" className="vignette pointer-events-none absolute inset-0" />
    </section>
  )
}
