import { PencilSimple } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import type { Phrase } from '../lib/markdown'
import { estReecrite, texteAffiche } from '../lib/reecritures'
import { cheminReecrire } from '../lib/rubriques'
import { useEtat } from '../etat/contexte'
import { BadgeMaVersion } from './Badges'

export default function PhraseCarte({ phrase, grand = false }: { phrase: Phrase; grand?: boolean }) {
  const { etat } = useEtat()
  const historique = etat.reecritures[phrase.id]
  const reecrite = estReecrite(historique)
  const texte = texteAffiche(phrase.texte, historique)

  return (
    <li
      className={`flex items-start gap-2 rounded-card border bg-panel py-3.5 pr-1.5 pl-4 ${
        reecrite ? 'border-accent/40' : 'border-border'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`${grand ? 'text-[1.1875rem]' : 'text-[1.0625rem]'} leading-snug`}>{texte}</p>
        {reecrite && (
          <div className="mt-2">
            <BadgeMaVersion />
          </div>
        )}
      </div>
      <Link
        to={cheminReecrire(phrase.id)}
        aria-label={`Réécrire : ${texte}`}
        className="-my-1.5 shrink-0 rounded-control p-2.5 text-text-muted active:bg-panel-raised active:text-accent"
      >
        <PencilSimple size={20} aria-hidden />
      </Link>
    </li>
  )
}
