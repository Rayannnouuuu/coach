import { CaretRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import type { Fiche } from '../lib/markdown'
import { BadgeExemple } from './Badges'

export default function ListeFiches({ fiches, base }: { fiches: Fiche[]; base: string }) {
  if (fiches.length === 0) {
    return <p className="rounded-card bg-panel p-5 text-text-muted">Rien ici pour l’instant.</p>
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {fiches.map((f) => {
        const nbPhrases = f.sections.reduce((n, s) => n + s.phrases.length, 0)
        return (
          <li key={f.id}>
            <Link
              to={`${base}/${f.id}`}
              className="flex items-center gap-3 rounded-card border border-border bg-panel px-4 py-4 active:bg-panel-raised"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[1.0625rem] font-semibold">{f.titre}</span>
                  {f.exemple && <BadgeExemple />}
                </div>
                <div className="mt-0.5 text-sm text-text-muted">
                  {f.sections.map((s) => s.titre).join(' · ')} — {nbPhrases} phrase{nbPhrases > 1 ? 's' : ''}
                </div>
              </div>
              <CaretRight size={18} className="shrink-0 text-text-muted" aria-hidden />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
