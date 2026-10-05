import { beforeEach, describe, expect, it } from 'vitest'
import { etatVide } from '../etat'
import { CLE, ecrireEtat, lireEtat, mettreDeCote } from '../stockage'

const maintenant = new Date('2026-10-05T10:00:00Z')

describe('stockage', () => {
  beforeEach(() => localStorage.clear())

  it('renvoie un état vide si rien n’est stocké', () => {
    expect(lireEtat(localStorage, maintenant)).toEqual({ etat: etatVide(maintenant), avertissement: null })
  })

  it('relit ce qui a été écrit', () => {
    const etat = { ...etatVide(maintenant), cartes: { 'a/s/0': { boite: 1 as const, prochaine: '2026-10-06', vues: 1 } } }
    expect(ecrireEtat(etat)).toBe(true)
    expect(lireEtat(localStorage, maintenant).etat).toEqual(etat)
  })

  it('met de côté un état corrompu au lieu de l’écraser', () => {
    localStorage.setItem(CLE, '{pas du json')
    const { etat, avertissement } = lireEtat(localStorage, maintenant)
    expect(etat).toEqual(etatVide(maintenant))
    expect(avertissement).toMatch(/illisibles/)
    const cles = Object.keys(localStorage).filter((k) => k.startsWith(`${CLE}.sauvegarde-`))
    expect(cles).toHaveLength(1)
    expect(localStorage.getItem(cles[0])).toBe('{pas du json')
  })

  it('met de côté un état de version inconnue', () => {
    localStorage.setItem(CLE, JSON.stringify({ ...etatVide(), version: 99 }))
    expect(lireEtat(localStorage, maintenant).avertissement).toMatch(/version 99/)
  })

  it('copie l’état sous une clé datée', () => {
    mettreDeCote(etatVide(maintenant), 'avant-import', localStorage, maintenant)
    expect(Object.keys(localStorage).some((k) => k.startsWith(`${CLE}.avant-import-`))).toBe(true)
  })
})
