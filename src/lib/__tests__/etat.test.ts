import { describe, expect, it } from 'vitest'
import { ErreurEtat, etatVide, validerEtat, VERSION_ETAT } from '../etat'

const valide = () => ({
  ...etatVide(new Date('2026-10-05T10:00:00Z')),
  reecritures: { 'a/s/0': [{ texte: 'Ma version', date: '2026-10-05T10:00:00Z' }, { texte: null, date: '2026-10-06T10:00:00Z' }] },
  cartes: { 'a/s/0': { boite: 2, prochaine: '2026-10-08', vues: 3 } },
  objectifs: [{ id: 'o1', libelle: 'Proposer', cible: 3, historique: { '2026-W41': 1 } }],
})

describe('validerEtat', () => {
  it('accepte un état valide', () => {
    expect(validerEtat(valide())).toEqual(valide())
  })

  it('accepte un état vide', () => {
    expect(validerEtat(etatVide())).toMatchObject({ version: VERSION_ETAT })
  })

  it.each([
    ['pas un objet', 'coucou'],
    ['sans version', { ...valide(), version: undefined }],
    ['version future', { ...valide(), version: VERSION_ETAT + 1 }],
    ['reecritures non objet', { ...valide(), reecritures: [] }],
    ['réécriture sans date', { ...valide(), reecritures: { x: [{ texte: 'a' }] } }],
    ['boîte hors limites', { ...valide(), cartes: { x: { boite: 6, prochaine: '2026-10-08', vues: 0 } } }],
    ['date de carte invalide', { ...valide(), cartes: { x: { boite: 1, prochaine: 'demain', vues: 0 } } }],
    ['objectif sans cible', { ...valide(), objectifs: [{ id: 'o', libelle: 'x', historique: {} }] }],
    ['dernierExport invalide', { ...valide(), dernierExport: 3 }],
  ])('refuse %s', (_, brut) => {
    expect(() => validerEtat(brut)).toThrow(ErreurEtat)
  })
})
