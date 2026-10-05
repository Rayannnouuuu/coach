import EnTete from '../components/EnTete'
import PhraseCarte from '../components/PhraseCarte'
import { useEtat } from '../etat/contexte'
import { contenu } from '../lib/contenu'
import { estReecrite } from '../lib/reecritures'
import { RUBRIQUES } from '../lib/rubriques'

export default function MonDiscours() {
  const { etat } = useEtat()
  const groupes = contenu.fiches
    .map((fiche) => ({
      fiche,
      phrases: fiche.sections.flatMap((s) => s.phrases).filter((p) => estReecrite(etat.reecritures[p.id])),
    }))
    .filter((g) => g.phrases.length > 0)

  return (
    <>
      <EnTete
        titre="Mon discours"
        retour={{ vers: '/plus', libelle: 'Plus' }}
        sousTitre="Toutes les phrases que j’ai réécrites avec mes mots."
      />
      {groupes.length === 0 ? (
        <p className="rounded-card bg-panel p-5 text-text-muted">
          Aucune phrase réécrite pour l’instant. Touche le crayon à côté d’une phrase pour la dire à ta façon.
        </p>
      ) : (
        <div className="flex flex-col gap-7">
          {groupes.map(({ fiche, phrases }) => (
            <section key={fiche.id}>
              <h2 className="mb-2.5 text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
                {RUBRIQUES[fiche.type].titre} · {fiche.titre}
              </h2>
              <ul className="flex flex-col gap-2">
                {phrases.map((p) => (
                  <PhraseCarte key={p.id} phrase={p} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
