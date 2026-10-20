// Post-build: one static HTML file per route with its own title/description/Open Graph tags,
// a PNG share card per case, a sitemap and a GitHub Pages 404 fallback. Crawlers don't run JS.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const root = new URL('..', import.meta.url).pathname
const read = (p) => JSON.parse(readFileSync(root + p, 'utf8'))
const site = read('content/site.json')
const resume = read('content/resume.json')
const { featured } = read('content/cases.json')
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/')
const dist = root + 'dist/'
const template = readFileSync(dist + 'index.html', 'utf8')
const origin = site.url.replace(/\/$/, '')
if (!origin) console.warn('prerender: content/site.json "url" is empty, so og:image and sitemap URLs will be relative.')
const abs = (path) => `${origin}${base}${path}`.replace(/([^:]\/)\/+/g, '$1')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function page({ path, title, description, image }) {
  const tags = [
    origin && `<link rel="canonical" href="${abs(path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${abs(path)}" />`,
    `<meta property="og:image" content="${abs(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].filter(Boolean).join('\n    ')
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('</head>', `    ${tags}\n  </head>`)
  mkdirSync(dist + path, { recursive: true })
  writeFileSync(dist + path + 'index.html', html)
  return html
}

function wrap(text, max) {
  const lines = []
  for (const word of text.split(' ')) {
    const last = lines.at(-1)
    if (last && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word
    else lines.push(word)
  }
  return lines
}

function card({ kicker, headline, sub }) {
  const lines = wrap(headline.toUpperCase(), 22).slice(0, 3)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="lamp" cx="0.25" cy="0.2" r="0.9"><stop offset="0" stop-color="#e8c36a" stop-opacity="0.28"/><stop offset="1" stop-color="#e8c36a" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#0d0d0f"/><rect width="1200" height="630" fill="url(#lamp)"/>
  <g transform="rotate(-1.5 600 315)">
    <rect x="80" y="70" width="1040" height="490" fill="#d9c08c"/>
    <rect x="80" y="40" width="240" height="40" rx="6" fill="#d9c08c"/>
    <text x="130" y="150" font-family="Special Elite" font-size="30" fill="#2a2622" letter-spacing="4">${esc(kicker)}</text>
    ${lines.map((l, i) => `<text x="130" y="${245 + i * 84}" font-family="Oswald" font-weight="700" font-size="76" fill="#2a2622">${esc(l)}</text>`).join('')}
    <text x="130" y="${245 + lines.length * 84 + 10}" font-family="Special Elite" font-size="32" fill="#2a2622">${esc(sub)}</text>
    <g transform="rotate(-12 930 160)"><rect x="830" y="120" width="220" height="74" fill="none" stroke="#b3202a" stroke-width="6"/><text x="940" y="176" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="48" fill="#b3202a" letter-spacing="6">CLOSED</text></g>
  </g>
  <text x="80" y="605" font-family="Special Elite" font-size="26" fill="#e8c36a" letter-spacing="3">${esc(resume.name.toUpperCase())} · CASE FILES</text>
</svg>`
  return new Resvg(svg, {
    font: { fontFiles: [root + 'scripts/fonts/Oswald.ttf', root + 'scripts/fonts/SpecialElite-Regular.ttf'], loadSystemFonts: false },
  }).render().asPng()
}

mkdirSync(dist + 'og', { recursive: true })
writeFileSync(dist + 'og/home.png', card({ kicker: 'CASE FILES · ASHPORT', headline: resume.name, sub: resume.headline }))
const home = page({ path: '', title: site.title, description: site.description, image: 'og/home.png' })
writeFileSync(dist + '404.html', home)

for (const c of featured) {
  writeFileSync(dist + `og/${c.caseNumber}.png`, card({ kicker: `CASE #${c.caseNumber}`, headline: c.codename, sub: c.realTitle }))
  page({ path: `case/${c.caseNumber}/`, title: `Case #${c.caseNumber}: ${c.codename} · ${resume.name}`, description: `${c.realTitle}: ${c.oneLiner}`, image: `og/${c.caseNumber}.png` })
}

const urls = ['', ...featured.map((c) => `case/${c.caseNumber}/`)]
writeFileSync(dist + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${abs(u)}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(dist + 'robots.txt', `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${abs('sitemap.xml')}\n` : ''}`)
console.log(`prerender: ${urls.length} pages, ${featured.length + 1} share cards`)
