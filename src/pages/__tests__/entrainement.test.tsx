import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { contenu } from '../../lib/contenu'
import { CLE } from '../../lib/stockage'
import { rendreApp } from '../../test/rendre'

const nbObjections = [...contenu.phrases.values()].filter((p) => p.fiche.type === 'objection').length

describe('S’entraîner', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 5, 9))
  })
  afterEach(() => vi.useRealTimers())

  it('déroule une session : retourner, noter, enregistrer la progression', async () => {
    const { user } = rendreApp('/entrainement')
    await user.click(screen.getByRole('button', { name: 'Objections' }))
    expect(screen.getByText(String(nbObjections))).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Commencer/ }))

    expect(screen.getByLabelText('Progression')).toHaveTextContent(`1 / ${nbObjections}`)
    expect(screen.getByRole('heading', { name: /^Objection :/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Naturel' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retourner' }))
    await user.click(screen.getByRole('button', { name: 'Naturel' }))
    expect(screen.getByLabelText('Progression')).toHaveTextContent(`2 / ${nbObjections}`)

    const cartes = JSON.parse(localStorage.getItem(CLE)!).cartes
    expect(Object.values(cartes)).toEqual([{ boite: 1, prochaine: '2026-10-06', vues: 1 }])

    await user.click(screen.getByRole('button', { name: 'Arrêter' }))
    expect(screen.getByText(String(nbObjections - 1))).toBeInTheDocument()
  })

  it('affiche un bilan en fin de session', async () => {
    const { user } = rendreApp('/entrainement')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Thème' }), 'prix')
    await user.click(screen.getByRole('button', { name: /Commencer/ }))
    const total = Number(screen.getByLabelText('Progression').textContent!.split('/')[1])
    for (let i = 0; i < total; i++) {
      await user.click(screen.getByRole('button', { name: 'Retourner' }))
      await user.click(screen.getByRole('button', { name: i === 0 ? 'À revoir' : 'Naturel' }))
    }
    expect(screen.getByRole('heading', { name: 'Session terminée' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Terminer' }))
    // La carte « À revoir » reste due aujourd'hui.
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
