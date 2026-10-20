import { useMemo } from 'react'

// Seeded PRNG so the city looks the same on every visit.
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

type Building = { x: number; w: number; h: number; windows: { x: number; y: number }[] }

function buildings(seed: number, count: number, minH: number, maxH: number, litChance: number): Building[] {
  const r = rng(seed)
  const out: Building[] = []
  let x = -10
  for (let i = 0; i < count && x < 420; i++) {
    const w = 18 + r() * 34
    const h = minH + r() * (maxH - minH)
    const windows = []
    for (let wy = 300 - h + 8; wy < 292; wy += 9)
      for (let wx = x + 4; wx < x + w - 6; wx += 7) if (r() < litChance) windows.push({ x: wx, y: wy })
    out.push({ x, w, h, windows })
    x += w + r() * 4
  }
  return out
}

/** Original night skyline of Ashport, the city on this site. Pure SVG. */
export default function Skyline() {
  const far = useMemo(() => buildings(7, 30, 110, 230, 0.06), [])
  const near = useMemo(() => buildings(42, 22, 50, 160, 0.1), [])

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0c10" />
          <stop offset="0.7" stopColor="#1b1d24" />
          <stop offset="1" stopColor="#2a2a2c" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      <circle cx="320" cy="55" r="18" fill="#d6d8dc" opacity="0.12" />

      {far.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={300 - b.h} width={b.w} height={b.h} fill="#1c1e23" />
          {b.windows.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width="3" height="4" fill="#e8c36a" opacity="0.35" />
          ))}
        </g>
      ))}

      {/* Distant neon. Generic words only. */}
      <g filter="url(#glow)" fontFamily="Oswald, sans-serif" fontWeight="700">
        <text fontSize="14" fill="#d8434c" className="neon-buzz" textAnchor="middle">
          {'HOTEL'.split('').map((c, i) => (
            <tspan key={i} x="92" y={72 + i * 15}>
              {c}
            </tspan>
          ))}
        </text>
      </g>

      {near.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={300 - b.h} width={b.w} height={b.h} fill="#0f1013" />
          {b.windows.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width="3" height="4" fill="#e8c36a" opacity="0.6" />
          ))}
        </g>
      ))}
      <text x="214" y="232" fontSize="9" fill="#e8c36a" letterSpacing="1.5" filter="url(#glow)" fontFamily="Oswald, sans-serif" fontWeight="700">
        OPEN ALL NIGHT
      </text>
      <rect y="240" width="400" height="60" fill="#2a2a2c" opacity="0.25" />
    </svg>
  )
}
