import { ArrowsClockwise } from '@phosphor-icons/react'
import { useState } from 'react'
import { BadgeExemple, BadgeMaVersion } from '../components/Badges'
import EnTete from '../components/EnTete'
import { useEtat } from '../etat/contexte'
import { contenu, type PhraseEnContexte } from '../lib/contenu'
import { LIMITE_SESSION, sessionDuJour, type FiltreSession, type Note } from '../lib/leitner'
import type { TypeFiche } from '../lib/markdown'
import { estReecrite, texteAffiche } from '../lib/reecritures'

const CHOIX_TYPES: Array<{ valeur: TypeFiche | null; libelle: string }> = [
  { valeur: null, libelle: 'Tout' },
  { valeur: 'objection', libelle: 'Objections' },
  { valeur: 'produit', libelle: 'Produits' },
  { valeur: 'avant', libelle: 'Avant' },
]

const NOTES: Array<{ note: Note; libelle: string; classe: string }> = [
  { note: 'a-revoir', libelle: 'À revoir', classe: 'bg-danger-soft text-danger' },
  { note: 'hesitant', libelle: 'Hésitant', classe: 'bg-exemple-soft text-exemple' },
  { note: 'naturel', libelle: 'Naturel', classe: 'bg-success-soft text-success' },
]

const toutesPhrases = [...contenu.phrases.values()]
const tousTags = [...new Set(contenu.fiches.flatMap((f) => f.tags))].sort((a, b) => a.localeCompare(b, 'fr'))

type Session = { ids: string[]; index: number; retournee: boolean; notes: Note[] }

export default function Entrainement() {
  const { etat } = useEtat()
  const [type, setType] = useState<TypeFiche | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const filtre: FiltreSession = { types: type ? [type] : undefined, tag }
  const dues = sessionDuJour(toutesPhrases, etat.cartes, new Date(), filtre, Infinity)
  const maitrisees = toutesPhrases.filter((p) => (etat.cartes[p.id]?.boite ?? 0) >= 4).length

  const commencer = () =>
    setSession({
      ids: sessionDuJour(toutesPhrases, etat.cartes, new Date(), filtre).map((p) => p.id),
      index: 0,
      retournee: false,
      notes: [],
    })

  if (session && session.index < session.ids.length) {
    return <CarteEnCours session={session} setSession={setSession} />
  }

  if (session) {
    const compte = (n: Note) => session.notes.filter((x) => x === n).length
    return (
      <>
        <EnTete titre="Session terminée" />
        <div className="rounded-card border border-border bg-panel p-5">
          <p className="text-lg font-semibold">
            {session.ids.length} carte{session.ids.length > 1 ? 's' : ''} révisée{session.ids.length > 1 ? 's' : ''}
          </p>
          <ul className="mt-3 flex gap-2">
            {NOTES.map(({ note, libelle, classe }) => (
              <li key={note} className={`flex-1 rounded-input px-3 py-2 text-center text-sm font-medium ${classe}`}>
                <span className="block text-xl font-semibold">{compte(note)}</span>
                {libelle}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setSession(null)}
          className="mt-4 w-full rounded-control bg-accent py-3.5 font-semibold text-bg"
        >
          Terminer
        </button>
      </>
    )
  }

  return (
    <>
      <EnTete
        titre="S’entraîner"
        sousTitre={`${maitrisees} / ${toutesPhrases.length} phrases bien ancrées`}
      />

      <fieldset className="mb-3">
        <legend className="sr-only">Type de cartes</legend>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {CHOIX_TYPES.map(({ valeur, libelle }) => (
            <button
              key={libelle}
              type="button"
              aria-pressed={type === valeur}
              onClick={() => setType(valeur)}
              className={`shrink-0 rounded-control border px-4 py-2 text-sm font-medium ${
                type === valeur ? 'border-accent bg-accent-soft text-accent-strong' : 'border-border text-text-muted'
              }`}
            >
              {libelle}
            </button>
          ))}
        </div>
      </fieldset>

      {tousTags.length > 0 && (
        <label className="mb-5 flex items-center gap-3 text-sm text-text-muted">
          Thème
          <select
            value={tag ?? ''}
            onChange={(e) => setTag(e.target.value || null)}
            className="flex-1 rounded-input border border-border bg-panel px-3 py-2.5 text-base text-text"
          >
            <option value="">Tous</option>
            {tousTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="rounded-card border border-border bg-panel p-5 text-center">
        {dues.length === 0 ? (
          <>
            <p className="text-lg font-semibold">Rien à revoir aujourd’hui</p>
            <p className="mt-1 text-sm text-text-muted">Reviens demain, ou change de filtre.</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-semibold text-accent">{dues.length}</p>
            <p className="mt-1 text-text-muted">carte{dues.length > 1 ? 's' : ''} à revoir aujourd’hui</p>
            <button
              type="button"
              onClick={commencer}
              className="mt-5 w-full rounded-control bg-accent py-3.5 font-semibold text-bg"
            >
              Commencer{dues.length > LIMITE_SESSION ? ` (${LIMITE_SESSION} cartes)` : ''}
            </button>
          </>
        )}
      </div>
    </>
  )
}

function CarteEnCours({ session, setSession }: { session: Session; setSession: (s: Session | null) => void }) {
  const { etat, evaluerCarte } = useEtat()
  const phrase = contenu.phrases.get(session.ids[session.index]) as PhraseEnContexte
  const historique = etat.reecritures[phrase.id]
  const contexte = phrase.fiche.type === 'objection' ? `Objection : ${phrase.fiche.titre}` : phrase.fiche.titre

  const noter = (note: Note) => {
    evaluerCarte(phrase.id, note)
    setSession({ ...session, index: session.index + 1, retournee: false, notes: [...session.notes, note] })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => setSession(null)} className="py-1 text-sm font-medium text-accent">
          Arrêter
        </button>
        <span className="text-sm text-text-muted" aria-label="Progression">
          {session.index + 1} / {session.ids.length}
        </span>
      </div>
      <div className="mb-5 h-1 overflow-hidden rounded-control bg-panel" aria-hidden>
        <div
          className="h-full bg-accent transition-[width]"
          style={{ width: `${(session.index / session.ids.length) * 100}%` }}
        />
      </div>

      <article className="flex min-h-[18rem] flex-col rounded-card border border-border bg-panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">{phrase.sectionTitre}</span>
          {phrase.fiche.exemple && <BadgeExemple />}
          {estReecrite(historique) && <BadgeMaVersion />}
        </div>
        <h2 className="mt-2 text-xl leading-snug font-semibold">{contexte}</h2>
        {phrase.total > 1 && (
          <p className="mt-1 text-sm text-text-muted">
            Phrase {phrase.rang} sur {phrase.total}
          </p>
        )}

        {session.retournee ? (
          <p className="mt-6 border-t border-border pt-5 text-[1.25rem] leading-snug">
            {texteAffiche(phrase.texte, historique)}
          </p>
        ) : (
          <p className="mt-auto pt-6 text-sm text-text-muted">Dis-la à voix haute, puis retourne la carte.</p>
        )}
      </article>

      {session.retournee ? (
        <div className="mt-4 flex gap-2">
          {NOTES.map(({ note, libelle, classe }) => (
            <button
              key={note}
              type="button"
              onClick={() => noter(note)}
              className={`flex-1 rounded-control py-3.5 font-semibold ${classe}`}
            >
              {libelle}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSession({ ...session, retournee: true })}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent py-3.5 font-semibold text-bg"
        >
          <ArrowsClockwise size={18} weight="bold" aria-hidden />
          Retourner
        </button>
      )}
    </>
  )
}
