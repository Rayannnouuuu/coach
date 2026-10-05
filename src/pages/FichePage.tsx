import { Navigate, useParams } from 'react-router-dom'
import { BadgeExemple } from '../components/Badges'
import EnTete from '../components/EnTete'
import FicheVue from '../components/FicheVue'
import { contenu } from '../lib/contenu'
import type { TypeFiche } from '../lib/markdown'
import { RUBRIQUES } from './Rubrique'

export default function FichePage({ type }: { type: TypeFiche }) {
  const { id } = useParams()
  const fiche = id ? contenu.parId.get(id) : undefined
  const rubrique = RUBRIQUES[type]
  if (!fiche || fiche.type !== type) return <Navigate to={rubrique.chemin} replace />

  return (
    <>
      <EnTete
        titre={fiche.titre}
        retour={{ vers: rubrique.chemin, libelle: rubrique.titre }}
        sousTitre={fiche.exemple ? <BadgeExemple /> : undefined}
      />
      <FicheVue fiche={fiche} grand={type === 'avant'} />
    </>
  )
}
