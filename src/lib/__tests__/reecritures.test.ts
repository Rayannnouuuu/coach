import { describe, expect, it } from 'vitest'
import { ajouterReecriture, estReecrite, texteAffiche } from '../reecritures'

const t = new Date('2026-10-05T10:00:00Z')

describe('réécritures', () => {
  it('affiche l’original tant qu’il n’y a rien', () => {
    expect(texteAffiche('orig', undefined)).toBe('orig')
    expect(estReecrite(undefined)).toBe(false)
  })

  it('affiche la dernière version, et l’original après un retour', () => {
    let h = ajouterReecriture('orig', undefined, ' Ma version ', t)
    expect(texteAffiche('orig', h)).toBe('Ma version')
    expect(estReecrite(h)).toBe(true)
    h = ajouterReecriture('orig', h, null, t)
    expect(h).toHaveLength(2)
    expect(texteAffiche('orig', h)).toBe('orig')
    expect(estReecrite(h)).toBe(false)
  })

  it('ignore un texte vide ou identique à la version affichée', () => {
    const h = ajouterReecriture('orig', undefined, 'A', t)
    expect(ajouterReecriture('orig', h, 'A', t)).toBe(h)
    expect(ajouterReecriture('orig', h, '   ', t)).toBe(h)
    expect(ajouterReecriture('orig', undefined, 'orig', t)).toEqual([])
  })
})
