import { describe, expect, it } from 'vitest'
import { ErreurEtat, etatVide } from '../etat'
import { lireSauvegarde, nomFichier, rappelSauvegarde, serialiser } from '../sauvegarde'

const t = new Date(2026, 9, 5, 9)
const avecDonnees = () => ({ ...etatVide(t), cartes: { 'a/s/0': { boite: 1 as const, prochaine: '2026-10-06', vues: 1 } } })

describe('sauvegarde', () => {
  it('nomme le fichier avec la date du jour', () => {
    expect(nomFichier(t)).toBe('coach-conseil-2026-10-05.json')
  })

  it('relit exactement ce qu’elle a exporté', () => {
    expect(lireSauvegarde(serialiser(avecDonnees()))).toEqual(avecDonnees())
  })

  it('refuse un fichier qui n’est pas du JSON ou pas une sauvegarde', () => {
    expect(() => lireSauvegarde('<html>')).toThrow(ErreurEtat)
    expect(() => lireSauvegarde('{"foo": 1}')).toThrow(/pas une sauvegarde/)
  })

  it('ne rappelle rien tant qu’il n’y a rien à perdre', () => {
    expect(rappelSauvegarde(etatVide(t), t)).toBe(false)
  })

  it('rappelle si jamais exporté ou exporté il y a plus de 30 jours', () => {
    expect(rappelSauvegarde(avecDonnees(), t)).toBe(true)
    expect(rappelSauvegarde({ ...avecDonnees(), dernierExport: new Date(2026, 8, 10).toISOString() }, t)).toBe(false)
    expect(rappelSauvegarde({ ...avecDonnees(), dernierExport: new Date(2026, 8, 1).toISOString() }, t)).toBe(true)
  })
})
