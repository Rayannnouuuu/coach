// Répétition espacée, système de Leitner à 6 boîtes.

import { ajouterJours, jour } from './dates'
import type { Boite, Carte } from './etat'
import type { PhraseEnContexte } from './contenu'

/** Intervalle en jours avant la prochaine révision, par boîte. */
export const INTERVALLES: Record<Boite, number> = { 0: 0, 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }

export type Note = 'a-revoir' | 'hesitant' | 'naturel'

export const LIMITE_SESSION = 15

export function evaluer(carte: Carte | undefined, note: Note, maintenant: Date): Carte {
  const boiteActuelle = carte?.boite ?? 0
  const boite: Boite =
    note === 'a-revoir' ? 0 : note === 'hesitant' ? boiteActuelle : (Math.min(boiteActuelle + 1, 5) as Boite)
  // « À revoir » reste due aujourd'hui ; « Hésitant » attend au moins un jour.
  const intervalle = note === 'hesitant' ? Math.max(INTERVALLES[boite], 1) : INTERVALLES[boite]
  return { boite, prochaine: jour(ajouterJours(maintenant, intervalle)), vues: (carte?.vues ?? 0) + 1 }
}

export function estDue(carte: Carte | undefined, maintenant: Date): boolean {
  return !carte || carte.prochaine <= jour(maintenant)
}

export type FiltreSession = {
  types?: Array<'produit' | 'objection' | 'avant'>
  tag?: string | null
}

/**
 * Cartes du jour : révisions dues d'abord (les plus en retard en premier),
 * puis les nouvelles ; objections prioritaires à chaque niveau.
 */
export function sessionDuJour(
  phrases: Iterable<PhraseEnContexte>,
  cartes: Record<string, Carte>,
  maintenant: Date,
  filtre: FiltreSession = {},
  limite = LIMITE_SESSION,
): PhraseEnContexte[] {
  const candidates = [...phrases].filter(
    (p) =>
      estDue(cartes[p.id], maintenant) &&
      (!filtre.types || filtre.types.includes(p.fiche.type)) &&
      (!filtre.tag || p.fiche.tags.includes(filtre.tag)),
  )
  const rang = (p: PhraseEnContexte) => {
    const c = cartes[p.id]
    return [c ? 0 : 1, p.fiche.type === 'objection' ? 0 : 1, c?.prochaine ?? ''] as const
  }
  return candidates
    .map((p, i) => ({ p, i, r: rang(p) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2].localeCompare(b.r[2]) || a.i - b.i)
    .slice(0, limite)
    .map(({ p }) => p)
}
