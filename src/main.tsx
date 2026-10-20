import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/oswald/latin-500.css'
import '@fontsource/oswald/latin-700.css'
import '@fontsource/special-elite/latin-400.css'
import '@fontsource/source-serif-4/latin-400.css'
import '@fontsource/source-serif-4/latin-600.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log(
  '%cYou opened the console. Good instinct.%c\n\nMost people stop at the surface. You came looking for what is underneath, and that is the whole job.\nThe source is on GitHub, the files are in /content, and the coffee went cold an hour ago.\n\n  github.com/Ayush1216',
  'font: 700 16px Oswald, sans-serif; color: #e8c36a; letter-spacing: 1px',
  'font: 13px "Special Elite", monospace; color: #9a9fa8',
)
