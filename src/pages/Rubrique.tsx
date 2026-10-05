import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState } from 'react'
import EnTete from '../components/EnTete'
import ListeFiches from '../components/ListeFiches'
import { useEtat } from '../etat/contexte'
import { contenu, fichesDeType } from '../lib/contenu'
import type { TypeFiche } from '../lib/markdown'
import { rechercherFiches } from '../lib/recherche'
import { RUBRIQUES } from '../lib/rubriques'

export default function Rubrique({ type, recherche = false }: { type: TypeFiche; recherche?: boolean }) {
  const { etat } = useEtat()
  const [requete, setRequete] = useState('')
  const { chemin, titre, intro } = RUBRIQUES[type]
  const fiches = rechercherFiches(fichesDeType(contenu, type), requete, etat.reecritures)

  return (
    <>
      <EnTete titre={titre} sousTitre={intro} />
      {recherche && (
        <label className="mb-4 flex items-center gap-2.5 rounded-input border border-border bg-panel px-3.5 focus-within:border-accent">
          <MagnifyingGlass size={18} className="text-text-muted" aria-hidden />
          <input
            type="search"
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder="Rechercher (ex. réfléchir, prix)"
            aria-label="Rechercher une objection"
            className="w-full bg-transparent py-3 text-base outline-none placeholder:text-text-muted"
            enterKeyHint="search"
          />
        </label>
      )}
      <ListeFiches fiches={fiches} base={chemin} />
    </>
  )
}
