# Case Files

The portfolio of **Ayush Parikh**, Software Engineer (AI/ML + backend systems), set in Ashport, an original rain-soaked noir city. Every project is a closed case.

The resume PDF downloads from the landing page or the Leave a Tip note.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, Motion (formerly Framer Motion) and React Router. The rain is a `<canvas>`, the corkboard strings are plain SVG, and every texture is CSS or SVG. The site builds to static files with no backend.

## Run it locally

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check, build, prerender pages and share cards into dist/
npm run preview   # serve dist/ at http://localhost:4173
npm run lint
```

## Editing content

All copy lives in `content/`. Edit the JSON and rebuild; there's no need to touch components.

| File | Drives |
|---|---|
| `content/resume.json` | Name, headline, summary, contact, location, skills, education, extracurriculars, resume download |
| `content/dossier.json` | The Dossier timeline (roles, tech chips per role, training, commendations). Figures in bullets get a highlighter automatically |
| `content/cases.json` | Featured cases (corkboard + `/case/<n>` pages) and the Cold Cases drawer |
| `content/tools.json` | The Locked Drawer. `level` (1–3) sets the dots and `usedIn` is the hover text |
| `content/site.json` | Deployed URL, site title and description (used for share cards, canonical links and the sitemap) |

Keys starting with `_` are notes for editors, and any object with `"publish": false` is hidden. A Vite plugin strips both at build time, so neither reaches the browser.

The resume download is `public/Resume_Ayush_Parikh.pdf`. Replace the file to update it, and change `resumeDownload` in `resume.json` if the name changes.

### Adding a case

Add an object to `featured` in `content/cases.json`:

```jsonc
{
  "caseNumber": "009",                  // also the URL: /case/009
  "codename": "The …",                  // the noir hook
  "repo": "Ayush1216/my-repo",          // or null
  "realTitle": "Plain project name",
  "oneLiner": "One plain-English sentence on what it is.",
  "status": "Closed",                   // Closed | Ongoing | Cold
  "dateOpened": "2026-11", "dateClosed": "2026-12",
  "theProblem": "What it solves and for whom.",
  "investigation": ["Design decisions, debugging, tradeoffs (4 points max)"],
  "evidence": {
    "stack": ["Python", "FastAPI"],
    "links": { "repo": "https://github.com/…", "live": "" },
    "flow": [{ "label": "Step", "detail": "What happens here", "note": "optional red margin note" }],
    "flowSource": "README",
    "languages": [{ "name": "Python", "percent": 70 }, { "name": "TypeScript", "percent": 30 }],  // optional, shown if 2+
    "screenshots": [{ "src": "/evidence/009-home.png", "alt": "Describe the image" }]
  },
  "verdict": ["Outcomes, only if you can source them"],
  "boardTags": ["Python", "LLMs & Agents"],   // corkboard index cards; reuse existing tags where you can
  "inferred": false,
  "sources": ["README", "resume"]
}
```

Put screenshots in `public/evidence/`; they're shown as black-and-white evidence photos. The page, its share card and its sitemap entry are generated on the next build.

## Deploying

`npm run build` writes a complete static site to `dist/`, with real HTML at `/case/001/` and every other case path, plus `404.html`, `sitemap.xml`, `robots.txt` and `og/*.png`. Once you know the final URL, set it in `content/site.json`, so share cards and the sitemap use absolute links.

### Vercel (recommended; works with a private repo on the free Hobby plan)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub and import the repo. Vercel detects Vite, so keep the defaults: build `npm run build`, output `dist`.
3. Click **Deploy**. You'll get a URL like `https://<project>.vercel.app`.
4. Put that URL in `content/site.json` → `url`, then commit and push. Every push to `main` redeploys.
5. Optional: add a custom domain under **Project → Settings → Domains**.

### GitHub Pages

A **private** repo can only publish Pages on GitHub Pro, Team or Enterprise; on the Free plan the repo must be public.

1. Choose the URL:
   - **User site** (`https://ayush1216.github.io`): name the repo `Ayush1216.github.io` and build with the default base path.
   - **Project site** (`https://ayush1216.github.io/<repo>/`): build with `BASE_PATH=/<repo>/`.
2. Add `.github/workflows/pages.yml` (this repo already has one, set up for `/Portfolio/`):

   ```yaml
   name: Deploy to Pages
   on: { push: { branches: [main] }, workflow_dispatch: {} }
   permissions: { contents: read, pages: write, id-token: write }
   concurrency: { group: pages, cancel-in-progress: true }
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22, cache: npm }
         - run: npm ci
         - run: npm run build
           env: { BASE_PATH: / }   # or /<repo>/ for a project site
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
3. In the repo, open **Settings → Pages → Source** and choose **GitHub Actions**.
4. Push to `main`. When the workflow finishes, put the Pages URL in `content/site.json` and push again.

## Accessibility and performance

- `prefers-reduced-motion` turns off the rain, lamp flicker, grain, typewriter, string drawing and folder animation.
- The corkboard and case folders work fully from the keyboard (Tab, arrow keys between folder tabs, Esc to close a case). There's a skip link and visible focus outlines, and contrast meets WCAG AA.
- The rain canvas pauses when it's off-screen or the tab is hidden. The case page loads on demand, screenshots are lazy-loaded and fonts are self-hosted.
- Lighthouse (mobile): Performance 93–96, Accessibility 100, Best Practices 100, SEO 100.

## Credits

Original city, art and sound, all generated in code. Font licenses are in [CREDITS.md](CREDITS.md).
