import { describe, expect, it } from 'vitest'
import { construireContenu, contenu, fichesDeType } from '../contenu'
import { ErreurContenu } from '../markdown'

const f = (id: string, type = 'produit', ordre = 1) =>
  `---\nid: ${id}\ntitre: ${id}\ntype: ${type}\nordre: ${ordre}\n---\n## S\n- a\n- b`

describe('construireContenu', () => {
  it('indexe fiches et phrases, triées par ordre', () => {
    const c = construireContenu({ 'b.md': f('b', 'produit', 2), 'a.md': f('a', 'objection', 1) })
    expect(c.fiches.map((x) => x.id)).toEqual(['a', 'b'])
    expect(c.phrases.get('b/s/1')).toMatchObject({ texte: 'b', rang: 2, total: 2, sectionTitre: 'S' })
    expect(fichesDeType(c, 'objection').map((x) => x.id)).toEqual(['a'])
  })

  it('refuse deux fiches avec le même id', () => {
    expect(() => construireContenu({ 'a.md': f('a'), 'b.md': f('a') })).toThrow(ErreurContenu)
  })
})

describe('le contenu réel de /contenu/', () => {
  it('se charge sans erreur et contient chaque type', () => {
    expect(fichesDeType(contenu, 'avant').length).toBeGreaterThan(0)
    expect(fichesDeType(contenu, 'produit').length).toBeGreaterThan(0)
    expect(fichesDeType(contenu, 'objection').length).toBeGreaterThan(0)
  })

  it('n’a aucune fiche vide', () => {
    for (const fiche of contenu.fiches) {
      expect(fiche.sections.flatMap((s) => s.phrases).length, fiche.id).toBeGreaterThan(0)
    }
  })
})
