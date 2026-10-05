import { CaretRight, Notebook } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import EnTete from '../components/EnTete'

export default function Plus() {
  return (
    <>
      <EnTete titre="Plus" />
      <Link
        to="/mon-discours"
        className="flex items-center gap-3 rounded-card border border-border bg-panel px-4 py-4 active:bg-panel-raised"
      >
        <Notebook size={22} className="text-accent" aria-hidden />
        <span className="flex-1 font-medium">Mon discours</span>
        <CaretRight size={18} className="text-text-muted" aria-hidden />
      </Link>
    </>
  )
}
