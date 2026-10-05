import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import EnTete from '../components/EnTete'
import { useEtat } from '../etat/contexte'
import { contenu } from '../lib/contenu'
import { estReecrite, texteAffiche } from '../lib/reecritures'
import { cheminFiche } from '../lib/rubriques'

const formatDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

export default function Reecrire() {
  const [params] = useSearchParams()
  const phrase = contenu.phrases.get(params.get('p') ?? '')
  if (!phrase) return <Navigate to="/avant" replace />
  // La clé force un éditeur neuf si on passe d'une phrase à l'autre.
  return <Editeur key={phrase.id} phraseId={phrase.id} />
}

function Editeur({ phraseId }: { phraseId: string }) {
  const phrase = contenu.phrases.get(phraseId)!
  const { etat, reecrire } = useEtat()
  const navigate = useNavigate()
  const location = useLocation()
  const historique = etat.reecritures[phraseId] ?? []
  const actuel = texteAffiche(phrase.texte, historique)
  const [brouillon, setBrouillon] = useState(actuel)

  const retourFiche = cheminFiche(phrase.fiche.type, phrase.fiche.id)
  const fermer = () => (location.key === 'default' ? navigate(retourFiche, { replace: true }) : navigate(-1))
  const enregistrer = (texte: string | null) => {
    reecrire(phraseId, phrase.texte, texte)
    fermer()
  }

  const modifie = brouillon.trim() !== actuel && brouillon.trim() !== ''

  return (
    <>
      <EnTete
        titre="Mon discours"
        retour={{ vers: retourFiche, libelle: phrase.fiche.titre }}
        sousTitre={`${phrase.sectionTitre} · phrase ${phrase.rang}/${phrase.total}`}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          enregistrer(brouillon)
        }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-card border border-border bg-panel px-4 py-3">
          <div className="mb-1 text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">Texte d’origine</div>
          <p className="text-[0.9375rem] leading-snug text-text-muted">{phrase.texte}</p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Comment je le dirais, avec mes mots</span>
          <textarea
            value={brouillon}
            onChange={(e) => setBrouillon(e.target.value)}
            rows={5}
            autoFocus
            className="rounded-input border border-border bg-panel-raised p-3.5 text-[1.0625rem] leading-snug outline-none focus:border-accent"
          />
        </label>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={fermer}
            className="flex-1 rounded-control border border-border py-3 font-medium active:bg-panel"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!modifie}
            className="flex-1 rounded-control bg-accent py-3 font-semibold text-bg disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>

        {estReecrite(historique) && (
          <button
            type="button"
            onClick={() => enregistrer(null)}
            className="inline-flex items-center justify-center gap-2 py-2 text-sm font-medium text-text-muted"
          >
            <ArrowCounterClockwise size={16} aria-hidden />
            Revenir au texte d’origine
          </button>
        )}
      </form>

      {historique.length > 0 && (
        <section className="mt-8" aria-labelledby="historique">
          <h2 id="historique" className="mb-2.5 text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
            Historique
          </h2>
          <ol className="flex flex-col gap-2">
            {historique
              .map((r, i) => ({ r, i }))
              .reverse()
              .map(({ r, i }) => {
                const courante = i === historique.length - 1
                return (
                  <li key={i} className="rounded-card border border-border bg-panel px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs text-text-muted">
                      <time dateTime={r.date}>{formatDate.format(new Date(r.date))}</time>
                      {courante ? (
                        <span className="font-semibold text-accent">Affichée</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => enregistrer(r.texte)}
                          className="font-semibold text-accent"
                        >
                          Restaurer
                        </button>
                      )}
                    </div>
                    <p className={`text-[0.9375rem] leading-snug ${r.texte === null ? 'text-text-muted italic' : ''}`}>
                      {r.texte ?? 'Texte d’origine'}
                    </p>
                  </li>
                )
              })}
          </ol>
        </section>
      )}
    </>
  )
}
