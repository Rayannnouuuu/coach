import type { Reecriture } from './etat'

/** Texte à afficher : la dernière réécriture, sinon le texte d'origine. */
export function texteAffiche(original: string, historique: Reecriture[] | undefined): string {
  return historique?.at(-1)?.texte ?? original
}

export function estReecrite(historique: Reecriture[] | undefined): boolean {
  const derniere = historique?.at(-1)
  return derniere !== undefined && derniere.texte !== null
}

/**
 * Ajoute une version à l'historique. Rien n'est jamais supprimé : revenir à
 * l'original ajoute une entrée `texte: null`. Ignore une version identique à
 * celle déjà affichée.
 */
export function ajouterReecriture(
  original: string,
  historique: Reecriture[] | undefined,
  texte: string | null,
  maintenant: Date,
): Reecriture[] {
  const liste = historique ?? []
  const propre = texte === null ? null : texte.trim()
  if (propre === '') return liste
  const normalise = propre === original ? null : propre
  if ((liste.at(-1)?.texte ?? null) === normalise) return liste
  return [...liste, { texte: normalise, date: maintenant.toISOString() }]
}
