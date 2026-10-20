import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content files carry private notes ("_..." keys) and unpublished fields ({ publish: false }).
// Strip them at build time so they never reach the public bundle.
function scrub(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(scrub)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k, x]) => !k.startsWith('_') && !(x && typeof x === 'object' && (x as { publish?: boolean }).publish === false))
        .map(([k, x]) => [k, scrub(x)]),
    )
  }
  return v
}

const scrubContent = (): Plugin => ({
  name: 'scrub-content',
  enforce: 'pre',
  transform(code, id) {
    if (/[\\/]content[\\/][^\\/]+\.json$/.test(id)) return JSON.stringify(scrub(JSON.parse(code)))
  },
})

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/: build with BASE_PATH=/<repo>/
  base: process.env.BASE_PATH ?? '/',
  plugins: [scrubContent(), react(), tailwindcss()],
})
