// Seul module qui touche à localStorage. Ne détruit jamais un état illisible :
// il est mis de côté sous une autre clé avant de repartir de zéro.

import { etatVide, validerEtat, type Etat } from './etat'

export const CLE = 'coach-conseil'

export type Lecture = {
  etat: Etat
  /** Message à afficher si l'état stocké était illisible et a été mis de côté. */
  avertissement: string | null
}

const horodatage = (d: Date) => d.toISOString().replace(/[:.]/g, '-')

export function lireEtat(stockage: Storage = localStorage, maintenant = new Date()): Lecture {
  let brut: string | null
  try {
    brut = stockage.getItem(CLE)
  } catch {
    return { etat: etatVide(maintenant), avertissement: 'Stockage local indisponible : rien ne sera enregistré.' }
  }
  if (brut === null) return { etat: etatVide(maintenant), avertissement: null }

  try {
    return { etat: validerEtat(JSON.parse(brut)), avertissement: null }
  } catch (e) {
    const cleSauvegarde = `${CLE}.sauvegarde-${horodatage(maintenant)}`
    try {
      stockage.setItem(cleSauvegarde, brut)
    } catch {
      // Pas de place pour la copie : on garde l'original intact et on ne réécrit pas par-dessus.
      return {
        etat: etatVide(maintenant),
        avertissement: 'Données locales illisibles et impossibles à mettre de côté. Exporte-les avant toute modification.',
      }
    }
    const detail = e instanceof Error ? ` (${e.message})` : ''
    return {
      etat: etatVide(maintenant),
      avertissement: `Données locales illisibles${detail}. Une copie a été gardée sous « ${cleSauvegarde} ».`,
    }
  }
}

export function ecrireEtat(etat: Etat, stockage: Storage = localStorage): boolean {
  try {
    stockage.setItem(CLE, JSON.stringify(etat))
    return true
  } catch {
    return false
  }
}

/** Copie l'état actuel sous une clé datée (avant un import, par exemple). */
export function mettreDeCote(etat: Etat, suffixe: string, stockage: Storage = localStorage, maintenant = new Date()) {
  try {
    stockage.setItem(`${CLE}.${suffixe}-${horodatage(maintenant)}`, JSON.stringify(etat))
    return true
  } catch {
    return false
  }
}
