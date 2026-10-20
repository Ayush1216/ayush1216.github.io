import { useEffect } from 'react'
import { useLocation } from 'react-router'
import Office from './Office'
import Corkboard from './Corkboard'
import { ColdCases, Dossier, Tip, Tools } from './Rooms'

export default function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    document.title = 'Case Files · Ayush Parikh'
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <main id="content">
      <Office />
      <Corkboard />
      <Dossier />
      <Tools />
      <ColdCases />
      <Tip />
    </main>
  )
}
