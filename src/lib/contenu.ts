import { ErreurContenu, parserFiche, type Fiche, type Phrase, type TypeFiche } from './markdown'

export type PhraseEnContexte = Phrase & {
  fiche: Fiche
  sectionTitre: string
  /** Position dans la section (1-based) et taille de la section. */
  rang: number
  total: number
}

export type Contenu = {
  fiches: Fiche[]
  parId: Map<string, Fiche>
  phrases: Map<string, PhraseEnContexte>
}

/** Construit l'index du contenu à partir des fichiers bruts `{ chemin: texte }`. */
export function construireContenu(fichiers: Record<string, string>): Contenu {
  const fiches = Object.entries(fichiers)
    .map(([chemin, brut]) => parserFiche(brut, chemin))
    .sort((a, b) => a.ordre - b.ordre || a.titre.localeCompare(b.titre, 'fr'))

  const parId = new Map<string, Fiche>()
  const phrases = new Map<string, PhraseEnContexte>()
  for (const fiche of fiches) {
    if (parId.has(fiche.id)) throw new ErreurContenu(fiche.id, 'id de fiche en double')
    parId.set(fiche.id, fiche)
    for (const section of fiche.sections) {
      section.phrases.forEach((p, i) => {
        phrases.set(p.id, { ...p, fiche, sectionTitre: section.titre, rang: i + 1, total: section.phrases.length })
      })
    }
  }
  return { fiches, parId, phrases }
}

export function fichesDeType(contenu: Contenu, type: TypeFiche): Fiche[] {
  return contenu.fiches.filter((f) => f.type === type)
}

const fichiers = import.meta.glob<string>('/contenu/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const contenu: Contenu = construireContenu(fichiers)
