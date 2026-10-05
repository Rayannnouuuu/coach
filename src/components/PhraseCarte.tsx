import type { Phrase } from '../lib/markdown'
import { estReecrite, texteAffiche } from '../lib/reecritures'
import { useEtat } from '../etat/contexte'
import { BadgeMaVersion } from './Badges'

export default function PhraseCarte({ phrase, grand = false }: { phrase: Phrase; grand?: boolean }) {
  const { etat } = useEtat()
  const historique = etat.reecritures[phrase.id]
  const reecrite = estReecrite(historique)

  return (
    <li
      className={`rounded-card border bg-panel px-4 py-3.5 ${reecrite ? 'border-accent/40' : 'border-border'}`}
    >
      <p className={`${grand ? 'text-[1.1875rem]' : 'text-[1.0625rem]'} leading-snug`}>
        {texteAffiche(phrase.texte, historique)}
      </p>
      {reecrite && (
        <div className="mt-2">
          <BadgeMaVersion />
        </div>
      )}
    </li>
  )
}
