import { describe, expect, it } from 'vitest'
import { semaineISO } from '../dates'
import { creerObjectif, faitCetteSemaine, incrementer, semainesPassees } from '../objectifs'

describe('semaineISO', () => {
  it.each([
    [new Date(2026, 9, 5), '2026-W41'],
    [new Date(2026, 9, 11), '2026-W41'],
    [new Date(2026, 9, 12), '2026-W42'],
    [new Date(2027, 0, 1), '2026-W53'],
    [new Date(2025, 11, 29), '2026-W01'],
  ])('%s → %s', (d, attendu) => {
    expect(semaineISO(d)).toBe(attendu)
  })
})

describe('objectifs', () => {
  const lundi = new Date(2026, 9, 5)
  const lundiSuivant = new Date(2026, 9, 12)

  it('compte par semaine et repart de zéro la semaine suivante', () => {
    let o = creerObjectif(' Proposer l’assurance ', 3, lundi)
    expect(o.libelle).toBe('Proposer l’assurance')
    o = incrementer(incrementer(o, 1, lundi), 1, lundi)
    expect(faitCetteSemaine(o, lundi)).toBe(2)
    expect(faitCetteSemaine(o, lundiSuivant)).toBe(0)
    expect(semainesPassees(o, lundiSuivant)).toEqual([{ semaine: '2026-W41', fait: 2 }])
  })

  it('ne descend pas sous zéro', () => {
    expect(faitCetteSemaine(incrementer(creerObjectif('x', 1, lundi), -1, lundi), lundi)).toBe(0)
  })
})
