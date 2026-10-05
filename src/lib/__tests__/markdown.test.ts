import { describe, expect, it } from 'vitest'
import { ErreurContenu, parserFiche, slugifier } from '../markdown'

const fiche = (fm: string, corps = '## Section\n- Phrase') => `---\n${fm}\n---\n${corps}`

describe('slugifier', () => {
  it('retire accents, ponctuation et majuscules', () => {
    expect(slugifier('Questions de découverte !')).toBe('questions-de-decouverte')
    expect(slugifier('  À éviter  ')).toBe('a-eviter')
  })
})

describe('parserFiche', () => {
  it('lit le front-matter, les sections, les phrases et les notes', () => {
    const f = parserFiche(
      fiche(
        'id: credit-conso\ntitre: Crédit\ntype: produit   # commentaire\ntags: [credit, projet]\nexemple: true\nordre: 3',
        '# Titre ignoré\n\n## Accroches\nUne consigne.\n- Première\n* Deuxième\n\n## À éviter\n- Rien',
      ),
      'x.md',
    )
    expect(f).toMatchObject({ id: 'credit-conso', titre: 'Crédit', type: 'produit', tags: ['credit', 'projet'], exemple: true, ordre: 3 })
    expect(f.sections).toHaveLength(2)
    expect(f.sections[0]).toEqual({
      slug: 'accroches',
      titre: 'Accroches',
      notes: ['Une consigne.'],
      phrases: [
        { id: 'credit-conso/accroches/0', texte: 'Première' },
        { id: 'credit-conso/accroches/1', texte: 'Deuxième' },
      ],
    })
    expect(f.sections[1].phrases[0].id).toBe('credit-conso/a-eviter/0')
  })

  it('applique des valeurs par défaut', () => {
    const f = parserFiche(fiche('id: a\ntitre: A\ntype: avant'), 'a.md')
    expect(f).toMatchObject({ tags: [], exemple: false, ordre: 100 })
  })

  it.each([
    ['sans front-matter', '## S\n- p'],
    ['front-matter non fermé', '---\nid: a\n## S'],
    ['id invalide', fiche('id: Pas Bon\ntitre: A\ntype: avant')],
    ['titre manquant', fiche('id: a\ntype: avant')],
    ['type inconnu', fiche('id: a\ntitre: A\ntype: autre')],
    ['exemple non booléen', fiche('id: a\ntitre: A\ntype: avant\nexemple: oui')],
    ['texte hors section', fiche('id: a\ntitre: A\ntype: avant', '- orpheline')],
    ['section en double', fiche('id: a\ntitre: A\ntype: avant', '## S\n## S')],
  ])('refuse une fiche %s', (_, brut) => {
    expect(() => parserFiche(brut, 'f.md')).toThrow(ErreurContenu)
  })

  it('cite le chemin du fichier dans l’erreur', () => {
    expect(() => parserFiche('rien', 'contenu/x.md')).toThrow(/contenu\/x\.md/)
  })
})
