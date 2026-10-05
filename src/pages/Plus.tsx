import { CaretRight, Notebook } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EnTete from '../components/EnTete'
import Objectifs from '../components/Objectifs'
import Sauvegarde from '../components/Sauvegarde'
import { contenu } from '../lib/contenu'

const nbExemples = contenu.fiches.filter((f) => f.exemple).length

export default function Plus() {
  const [maintenant] = useState(() => new Date())
  return (
    <>
      <EnTete titre="Plus" />
      <div className="flex flex-col gap-8">
        <Link
          to="/mon-discours"
          className="flex items-center gap-3 rounded-card border border-border bg-panel px-4 py-4 active:bg-panel-raised"
        >
          <Notebook size={22} className="text-accent" aria-hidden />
          <span className="flex-1 font-medium">Mon discours</span>
          <CaretRight size={18} className="text-text-muted" aria-hidden />
        </Link>

        <Objectifs maintenant={maintenant} />
        <Sauvegarde maintenant={maintenant} />

        <section aria-labelledby="a-propos" className="text-sm text-text-muted">
          <h2 id="a-propos" className="mb-2 text-xs font-semibold tracking-[0.08em] uppercase">
            À propos
          </h2>
          <p>
            Coach Conseil v{__VERSION__} · {contenu.fiches.length} fiches
            {nbExemples > 0 && <> dont {nbExemples} EXEMPLE</>}.
          </p>
          <p className="mt-1">Aucune donnée client. Aucune connexion à un service extérieur. Tout reste ici.</p>
        </section>
      </div>
    </>
  )
}
