import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { etatVide } from '../../lib/etat'
import { CLE } from '../../lib/stockage'
import { rendreApp } from '../../test/rendre'

describe('écrans en lecture', () => {
  beforeEach(() => localStorage.clear())

  it('ouvre sur Avant, avec les 5 onglets', () => {
    rendreApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Avant le RDV' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Avant',
      'Produits',
      'Objections',
      'S’entraîner',
      'Plus',
    ])
  })

  it('navigue d’une liste de produits vers une fiche et revient', async () => {
    const { user } = rendreApp('/produits')
    await user.click(screen.getByRole('link', { name: /Crédit à la consommation/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Crédit à la consommation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accroches' })).toBeInTheDocument()
    expect(screen.getByText('EXEMPLE')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Produits' , current: false }))
    expect(screen.getByRole('heading', { level: 1, name: 'Produits' })).toBeInTheDocument()
  })

  it('cherche une objection sans tenir compte des accents', async () => {
    const { user } = rendreApp('/objections')
    await user.type(screen.getByRole('searchbox'), 'reflechir')
    const liens = screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/objections/'))
    expect(liens.map((l) => l.getAttribute('href'))).toEqual(['/objections/je-vais-reflechir'])
  })

  it('affiche ma version d’une phrase réécrite', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify({
        ...etatVide(),
        reecritures: { 'trop-cher/accueillir/0': [{ texte: 'Je vous entends.', date: '2026-10-05T10:00:00Z' }] },
      }),
    )
    rendreApp('/objections/trop-cher')
    expect(screen.getByText('Je vous entends.')).toBeInTheDocument()
    expect(screen.getByText('Ma version')).toBeInTheDocument()
  })

  it('renvoie vers la liste si la fiche n’existe pas ou n’est pas du bon type', () => {
    rendreApp('/produits/trop-cher')
    expect(screen.getByRole('heading', { level: 1, name: 'Produits' })).toBeInTheDocument()
  })

  it('signale des données locales illisibles', () => {
    localStorage.setItem(CLE, 'cassé')
    rendreApp('/avant')
    expect(screen.getByRole('alert')).toHaveTextContent(/illisibles/)
  })
})
