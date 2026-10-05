// Parseur des fiches de /contenu/ : un front-matter simple puis des sections
// « ## Titre » contenant des listes « - phrase ». Volontairement minimal : pas
// de dépendance, et toute erreur de format fait échouer le build et les tests.

export type TypeFiche = 'avant' | 'produit' | 'objection'

export const TYPES_FICHE: readonly TypeFiche[] = ['avant', 'produit', 'objection']

/** Identifiant stable d'une phrase : `{fiche}/{section}/{index}`. */
export type PhraseId = string

export type Phrase = {
  id: PhraseId
  texte: string
}

export type Section = {
  slug: string
  titre: string
  /** Lignes hors liste (consignes, contexte), affichées telles quelles. */
  notes: string[]
  phrases: Phrase[]
}

export type Fiche = {
  id: string
  titre: string
  type: TypeFiche
  tags: string[]
  exemple: boolean
  ordre: number
  sections: Section[]
}

export class ErreurContenu extends Error {
  constructor(chemin: string, message: string) {
    super(`${chemin} : ${message}`)
    this.name = 'ErreurContenu'
  }
}

export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type ValeurFrontMatter = string | boolean | number | string[]

function lireValeur(brut: string): ValeurFrontMatter {
  const v = brut.trim()
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+$/.test(v)) return Number(v)
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return v.replace(/^["']|["']$/g, '')
}

function lireFrontMatter(lignes: string[], chemin: string) {
  if (lignes[0]?.trim() !== '---') {
    throw new ErreurContenu(chemin, 'front-matter manquant (la fiche doit commencer par ---)')
  }
  const fin = lignes.indexOf('---', 1)
  if (fin === -1) throw new ErreurContenu(chemin, 'front-matter non fermé (--- manquant)')

  const valeurs: Record<string, ValeurFrontMatter> = {}
  for (const ligne of lignes.slice(1, fin)) {
    if (!ligne.trim()) continue
    const m = /^([a-z_]+)\s*:\s*(.*)$/i.exec(ligne.replace(/\s+#.*$/, ''))
    if (!m) throw new ErreurContenu(chemin, `ligne de front-matter illisible : « ${ligne} »`)
    valeurs[m[1]] = lireValeur(m[2])
  }
  return { valeurs, corps: lignes.slice(fin + 1) }
}

export function parserFiche(brut: string, chemin: string): Fiche {
  const lignes = brut.replace(/\r\n?/g, '\n').split('\n')
  const { valeurs, corps } = lireFrontMatter(lignes, chemin)

  const { id, titre, type, tags = [], exemple = false, ordre = 100 } = valeurs
  if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) {
    throw new ErreurContenu(chemin, '« id » manquant ou invalide (minuscules, chiffres et tirets)')
  }
  if (typeof titre !== 'string' || !titre) throw new ErreurContenu(chemin, '« titre » manquant')
  if (typeof type !== 'string' || !TYPES_FICHE.includes(type as TypeFiche)) {
    throw new ErreurContenu(chemin, `« type » doit valoir ${TYPES_FICHE.join(', ')}`)
  }
  if (!Array.isArray(tags)) throw new ErreurContenu(chemin, '« tags » doit être une liste [a, b]')
  if (typeof exemple !== 'boolean') throw new ErreurContenu(chemin, '« exemple » doit valoir true ou false')
  if (typeof ordre !== 'number') throw new ErreurContenu(chemin, '« ordre » doit être un nombre')

  const sections: Section[] = []
  for (const ligne of corps) {
    const titreSection = /^##\s+(.+)$/.exec(ligne)
    if (titreSection) {
      const titre = titreSection[1].trim()
      const slug = slugifier(titre)
      if (sections.some((s) => s.slug === slug)) {
        throw new ErreurContenu(chemin, `section « ${titre} » en double`)
      }
      sections.push({ slug, titre, notes: [], phrases: [] })
      continue
    }
    const texte = ligne.trim()
    if (!texte || texte.startsWith('# ')) continue
    const section = sections.at(-1)
    if (!section) throw new ErreurContenu(chemin, 'texte avant la première section « ## »')
    const puce = /^[-*]\s+(.+)$/.exec(texte)
    if (puce) {
      section.phrases.push({ id: `${id}/${section.slug}/${section.phrases.length}`, texte: puce[1].trim() })
    } else {
      section.notes.push(texte)
    }
  }

  return { id, titre, type: type as TypeFiche, tags, exemple, ordre, sections }
}
