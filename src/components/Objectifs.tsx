import { Minus, Plus, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { useEtat } from '../etat/contexte'
import { faitCetteSemaine, semainesPassees } from '../lib/objectifs'

export default function Objectifs({ maintenant }: { maintenant: Date }) {
  const { etat, ajouterObjectif, ajusterObjectif, supprimerObjectif } = useEtat()
  const [libelle, setLibelle] = useState('')
  const [cible, setCible] = useState('3')

  return (
    <section aria-labelledby="objectifs" className="flex flex-col gap-2.5">
      <h2 id="objectifs" className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
        Objectifs de la semaine
      </h2>
      <p className="text-sm text-text-muted">Ce que je fais, moi. Jamais d’info sur un client.</p>

      {etat.objectifs.map((o) => {
        const fait = faitCetteSemaine(o, maintenant)
        const atteint = fait >= o.cible
        const passees = semainesPassees(o, maintenant)
        return (
          <article key={o.id} className="rounded-card border border-border bg-panel p-4">
            <div className="flex items-start gap-2">
              <h3 className="flex-1 font-medium">{o.libelle}</h3>
              <button
                type="button"
                aria-label={`Supprimer l’objectif ${o.libelle}`}
                onClick={() => window.confirm(`Supprimer « ${o.libelle} » et son historique ?`) && supprimerObjectif(o.id)}
                className="-m-1.5 p-1.5 text-text-muted"
              >
                <Trash size={18} aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                aria-label={`Retirer 1 à ${o.libelle}`}
                onClick={() => ajusterObjectif(o.id, -1)}
                disabled={fait === 0}
                className="rounded-control border border-border p-2.5 disabled:opacity-30"
              >
                <Minus size={18} aria-hidden />
              </button>
              <div className="flex-1">
                <div className="mb-1 text-center text-sm font-semibold" aria-label={`Progression de ${o.libelle}`}>
                  <span className={atteint ? 'text-success' : ''}>{fait}</span> / {o.cible}
                </div>
                <div className="h-1.5 overflow-hidden rounded-control bg-panel-raised" aria-hidden>
                  <div
                    className={`h-full ${atteint ? 'bg-success' : 'bg-accent'}`}
                    style={{ width: `${Math.min(100, (fait / o.cible) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label={`Ajouter 1 à ${o.libelle}`}
                onClick={() => ajusterObjectif(o.id, 1)}
                className="rounded-control bg-accent p-2.5 text-bg"
              >
                <Plus size={18} weight="bold" aria-hidden />
              </button>
            </div>
            {passees.length > 0 && (
              <details className="mt-3 text-sm text-text-muted">
                <summary>Semaines passées</summary>
                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {passees.map(({ semaine, fait }) => (
                    <li key={semaine} className="flex justify-between">
                      <span>{semaine.replace('-W', ' · semaine ')}</span>
                      <span className={fait >= o.cible ? 'text-success' : ''}>
                        {fait} / {o.cible}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        )
      })}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ajouterObjectif(libelle, Number(cible) || 1)
          setLibelle('')
        }}
        className="flex flex-col gap-2 rounded-card border border-dashed border-border p-4"
      >
        <input
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Ex. Proposer l’assurance habitation"
          aria-label="Nouvel objectif"
          className="rounded-input border border-border bg-panel px-3.5 py-2.5 text-base outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Fois par semaine
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={cible}
              onChange={(e) => setCible(e.target.value)}
              className="w-16 rounded-input border border-border bg-panel px-2 py-2.5 text-center text-base text-text outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={!libelle.trim()}
            className="ml-auto rounded-control bg-accent px-5 py-2.5 font-semibold text-bg disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
      </form>
    </section>
  )
}
