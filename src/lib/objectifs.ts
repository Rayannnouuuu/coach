import { semaineISO } from './dates'
import type { Objectif } from './etat'

export function faitCetteSemaine(objectif: Objectif, maintenant: Date): number {
  return objectif.historique[semaineISO(maintenant)] ?? 0
}

export function incrementer(objectif: Objectif, delta: number, maintenant: Date): Objectif {
  const semaine = semaineISO(maintenant)
  const fait = Math.max(0, (objectif.historique[semaine] ?? 0) + delta)
  return { ...objectif, historique: { ...objectif.historique, [semaine]: fait } }
}

export function creerObjectif(libelle: string, cible: number, maintenant: Date): Objectif {
  return {
    id: `obj-${maintenant.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    libelle: libelle.trim(),
    cible: Math.max(1, Math.round(cible)),
    historique: {},
  }
}

/** Semaines passées, la plus récente d'abord. */
export function semainesPassees(objectif: Objectif, maintenant: Date): Array<{ semaine: string; fait: number }> {
  const actuelle = semaineISO(maintenant)
  return Object.entries(objectif.historique)
    .filter(([s]) => s < actuelle)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([semaine, fait]) => ({ semaine, fait }))
}
