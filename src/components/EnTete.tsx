import { CaretLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  titre: string
  sousTitre?: ReactNode
  retour?: { vers: string; libelle: string }
  action?: ReactNode
}

export default function EnTete({ titre, sousTitre, retour, action }: Props) {
  return (
    <header className="mb-5">
      {retour && (
        <Link
          to={retour.vers}
          className="-ml-1 mb-2 inline-flex items-center gap-1 py-1 text-sm font-medium text-accent"
        >
          <CaretLeft size={16} weight="bold" aria-hidden />
          {retour.libelle}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight">{titre}</h1>
        {action}
      </div>
      {sousTitre && <div className="mt-1.5 text-sm text-text-muted">{sousTitre}</div>}
    </header>
  )
}
