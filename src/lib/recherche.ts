import type { Reecriture } from './etat'
import type { Fiche } from './markdown'
import { texteAffiche } from './reecritures'

const normaliser = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Filtre les fiches dont le titre, les tags ou une phrase (telle qu'affichée) contiennent tous les mots. */
export function rechercherFiches(fiches: Fiche[], requete: string, reecritures: Record<string, Reecriture[]>): Fiche[] {
  const mots = normaliser(requete).split(/\s+/).filter(Boolean)
  if (mots.length === 0) return fiches
  return fiches.filter((f) => {
    const texte = normaliser(
      [
        f.titre,
        ...f.tags,
        ...f.sections.flatMap((s) => [s.titre, ...s.notes, ...s.phrases.map((p) => texteAffiche(p.texte, reecritures[p.id]))]),
      ].join(' '),
    )
    return mots.every((m) => texte.includes(m))
  })
}
