// Modèle de l'état local. Tout tient dans un seul objet JSON versionné,
// sauvegardé dans localStorage et exportable tel quel.

import type { PhraseId } from './markdown'

export const VERSION_ETAT = 1

/** `texte: null` = retour au texte d'origine du Markdown. */
export type Reecriture = { texte: string | null; date: string }

export type Boite = 0 | 1 | 2 | 3 | 4 | 5

export type Carte = {
  boite: Boite
  /** Date locale AAAA-MM-JJ de la prochaine révision. */
  prochaine: string
  vues: number
}

export type Objectif = {
  id: string
  libelle: string
  cible: number
  /** Nombre d'actions faites par semaine ISO (ex. « 2026-W41 »). */
  historique: Record<string, number>
}

export type Etat = {
  version: typeof VERSION_ETAT
  reecritures: Record<PhraseId, Reecriture[]>
  cartes: Record<PhraseId, Carte>
  objectifs: Objectif[]
  /** Date ISO du dernier export, pour le rappel de sauvegarde. */
  dernierExport: string | null
  maj: string
}

export function etatVide(maintenant = new Date()): Etat {
  return {
    version: VERSION_ETAT,
    reecritures: {},
    cartes: {},
    objectifs: [],
    dernierExport: null,
    maj: maintenant.toISOString(),
  }
}

export class ErreurEtat extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErreurEtat'
  }
}

const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const estDateJour = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

/**
 * Migrations, une étape par version : `MIGRATIONS[n]` transforme un état v n
 * en état v n+1. Vide tant qu'on est en v1.
 */
const MIGRATIONS: Record<number, (ancien: Record<string, unknown>) => Record<string, unknown>> = {}

export function migrer(brut: unknown): unknown {
  if (!estObjet(brut) || typeof brut.version !== 'number') {
    throw new ErreurEtat('Fichier non reconnu : ce n’est pas une sauvegarde Coach Conseil.')
  }
  if (brut.version > VERSION_ETAT) {
    throw new ErreurEtat(
      `Sauvegarde en version ${brut.version}, plus récente que l’app (v${VERSION_ETAT}). Mets l’app à jour.`,
    )
  }
  let courant = brut
  for (let v = courant.version as number; v < VERSION_ETAT; v++) {
    const etape = MIGRATIONS[v]
    if (!etape) throw new ErreurEtat(`Aucune migration depuis la version ${v}.`)
    courant = { ...etape(courant), version: v + 1 }
  }
  return courant
}

/** Valide strictement un état (après migration). Lève ErreurEtat sinon. */
export function validerEtat(brut: unknown): Etat {
  const e = migrer(brut)
  const erreur = (champ: string) => new ErreurEtat(`Sauvegarde invalide : « ${champ} » incorrect.`)
  if (!estObjet(e)) throw erreur('racine')

  if (!estObjet(e.reecritures)) throw erreur('reecritures')
  for (const [id, liste] of Object.entries(e.reecritures)) {
    if (!Array.isArray(liste)) throw erreur(`reecritures.${id}`)
    for (const r of liste) {
      if (!estObjet(r) || !(typeof r.texte === 'string' || r.texte === null) || typeof r.date !== 'string') {
        throw erreur(`reecritures.${id}`)
      }
    }
  }

  if (!estObjet(e.cartes)) throw erreur('cartes')
  for (const [id, c] of Object.entries(e.cartes)) {
    if (
      !estObjet(c) ||
      !Number.isInteger(c.boite) ||
      (c.boite as number) < 0 ||
      (c.boite as number) > 5 ||
      !estDateJour(c.prochaine) ||
      !Number.isInteger(c.vues)
    ) {
      throw erreur(`cartes.${id}`)
    }
  }

  if (!Array.isArray(e.objectifs)) throw erreur('objectifs')
  for (const o of e.objectifs) {
    if (
      !estObjet(o) ||
      typeof o.id !== 'string' ||
      typeof o.libelle !== 'string' ||
      !Number.isInteger(o.cible) ||
      !estObjet(o.historique) ||
      !Object.values(o.historique).every((n) => Number.isInteger(n))
    ) {
      throw erreur('objectifs')
    }
  }

  if (!(e.dernierExport === null || typeof e.dernierExport === 'string')) throw erreur('dernierExport')
  if (typeof e.maj !== 'string') throw erreur('maj')

  return e as Etat
}
