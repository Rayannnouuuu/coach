import { jour, joursEntre } from './dates'
import { ErreurEtat, validerEtat, type Etat } from './etat'

export const DELAI_RAPPEL_JOURS = 30

export function nomFichier(maintenant: Date): string {
  return `coach-conseil-${jour(maintenant)}.json`
}

export function serialiser(etat: Etat): string {
  return JSON.stringify(etat, null, 2)
}

/** Lit et valide le contenu d'un fichier de sauvegarde. Lève ErreurEtat avec un message lisible. */
export function lireSauvegarde(texte: string): Etat {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    throw new ErreurEtat('Fichier illisible : ce n’est pas un fichier JSON.')
  }
  return validerEtat(brut)
}

export function aDesDonnees(etat: Etat): boolean {
  return Object.keys(etat.reecritures).length > 0 || Object.keys(etat.cartes).length > 0 || etat.objectifs.length > 0
}

/** Faut-il rappeler d'exporter ? Seulement s'il y a quelque chose à perdre. */
export function rappelSauvegarde(etat: Etat, maintenant: Date): boolean {
  if (!aDesDonnees(etat)) return false
  if (!etat.dernierExport) return true
  return joursEntre(new Date(etat.dernierExport), maintenant) > DELAI_RAPPEL_JOURS
}

/**
 * Propose le fichier : feuille de partage sur iPhone (→ « Enregistrer dans
 * Fichiers » / iCloud Drive), téléchargement classique ailleurs.
 * Renvoie false si j'ai annulé le partage.
 */
export async function proposerFichier(contenu: string, nom: string): Promise<boolean> {
  const fichier = new File([contenu], nom, { type: 'application/json' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title: nom })
      return true
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false
      // Partage refusé par le navigateur : on retombe sur le téléchargement.
    }
  }
  const url = URL.createObjectURL(fichier)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  document.body.append(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
