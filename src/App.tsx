import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import Header from './components/Header'
import Home from './components/Home'
import { setRain } from './lib/ambience'

const CaseFile = lazy(() => import('./components/CaseFile'))

export default function App() {
  const [sound, setSound] = useState(false) // not remembered: browsers block audio until a click anyway
  useEffect(() => setRain(sound), [sound])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <a href="#content" className="sr-only z-50 bg-lamp px-4 py-2 font-display text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
            Skip to content
          </a>
          <Header sound={sound} onSound={() => setSound(!sound)} />
          <Suspense fallback={<p className="p-8 font-type text-asphalt-300">Pulling the file…</p>}>
            <div className="grain">
              <Routes>
                <Route path="/case/:num" element={<CaseFile />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
          </Suspense>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  )
}
