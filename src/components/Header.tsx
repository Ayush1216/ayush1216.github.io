import { Link } from 'react-router'

const rooms = [
  ['Cases', 'corkboard'],
  ['Dossier', 'dossier'],
  ['Drawer', 'tools'],
  ['Cold Cases', 'cold-cases'],
  ['Tip', 'tip'],
]

export default function Header({ sound, onSound }: { sound: boolean; onSound: () => void }) {
  const btn = 'border border-asphalt-500 px-3 py-1.5 font-display text-xs tracking-widest uppercase transition hover:border-lamp hover:text-lamp'
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center gap-4 bg-ink/70 px-4 py-2 text-asphalt-100 backdrop-blur md:px-8">
      <Link to="/" className="font-type text-sm tracking-widest">
        A. Parikh
      </Link>
      <nav aria-label="Rooms" className="hidden gap-5 md:flex">
        {rooms.map(([label, id]) => (
          <Link key={id} to={`/#${id}`} className="font-display text-xs tracking-widest uppercase hover:text-lamp">
            {label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={onSound} aria-pressed={sound} className={btn}>
          Sound: {sound ? 'on' : 'off'}
        </button>
      </div>
    </header>
  )
}
