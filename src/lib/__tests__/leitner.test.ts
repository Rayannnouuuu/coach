import { describe, expect, it } from 'vitest'
import { construireContenu } from '../contenu'
import type { Carte } from '../etat'
import { estDue, evaluer, sessionDuJour } from '../leitner'

const lundi = new Date(2026, 9, 5, 9)

describe('evaluer', () => {
  it('fait monter une nouvelle carte en boîte 1 si c’est naturel', () => {
    expect(evaluer(undefined, 'naturel', lundi)).toEqual({ boite: 1, prochaine: '2026-10-06', vues: 1 })
  })

  it('suit les intervalles 1, 3, 7, 14, 30 jours', () => {
    const attendus = ['2026-10-06', '2026-10-08', '2026-10-12', '2026-10-19', '2026-11-04', '2026-11-04']
    let carte: Carte | undefined
    for (const date of attendus) {
      carte = evaluer(carte, 'naturel', lundi)
      expect(carte.prochaine).toBe(date)
    }
    expect(carte?.boite).toBe(5)
  })

  it('renvoie en boîte 0, due le jour même, si c’est à revoir', () => {
    expect(evaluer({ boite: 4, prochaine: '2026-10-05', vues: 6 }, 'a-revoir', lundi)).toEqual({
      boite: 0,
      prochaine: '2026-10-05',
      vues: 7,
    })
  })

  it('garde la boîte si c’est hésitant, au moins un jour plus tard', () => {
    expect(evaluer({ boite: 0, prochaine: '2026-10-05', vues: 1 }, 'hesitant', lundi)).toMatchObject({
      boite: 0,
      prochaine: '2026-10-06',
    })
    expect(evaluer({ boite: 3, prochaine: '2026-10-05', vues: 1 }, 'hesitant', lundi).prochaine).toBe('2026-10-12')
  })
})

describe('estDue', () => {
  it('considère une carte jamais vue ou en retard comme due', () => {
    expect(estDue(undefined, lundi)).toBe(true)
    expect(estDue({ boite: 1, prochaine: '2026-10-05', vues: 1 }, lundi)).toBe(true)
    expect(estDue({ boite: 1, prochaine: '2026-10-06', vues: 1 }, lundi)).toBe(false)
  })
})

describe('sessionDuJour', () => {
  const c = construireContenu({
    'p.md': '---\nid: p\ntitre: P\ntype: produit\ntags: [x]\n---\n## S\n- p0\n- p1',
    'o.md': '---\nid: o\ntitre: O\ntype: objection\n---\n## S\n- o0\n- o1',
  })
  const phrases = [...c.phrases.values()]

  it('place les révisions avant les nouvelles, objections d’abord', () => {
    const cartes = {
      'p/s/0': { boite: 1 as const, prochaine: '2026-10-01', vues: 1 },
      'o/s/1': { boite: 1 as const, prochaine: '2026-10-04', vues: 1 },
    }
    expect(sessionDuJour(phrases, cartes, lundi).map((p) => p.id)).toEqual(['o/s/1', 'p/s/0', 'o/s/0', 'p/s/1'])
  })

  it('exclut les cartes pas encore dues et respecte la limite', () => {
    const cartes = { 'o/s/0': { boite: 2 as const, prochaine: '2026-10-07', vues: 1 } }
    expect(sessionDuJour(phrases, cartes, lundi, {}, 2).map((p) => p.id)).toEqual(['o/s/1', 'p/s/0'])
  })

  it('filtre par type et par tag', () => {
    expect(sessionDuJour(phrases, {}, lundi, { types: ['produit'] }).map((p) => p.id)).toEqual(['p/s/0', 'p/s/1'])
    expect(sessionDuJour(phrases, {}, lundi, { tag: 'x' })).toHaveLength(2)
  })
})
