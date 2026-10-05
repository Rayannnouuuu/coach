import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { etatVide } from '../../lib/etat'
import { serialiser } from '../../lib/sauvegarde'
import { CLE } from '../../lib/stockage'
import { rendreApp } from '../../test/rendre'

describe('Plus', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 5, 9))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('crée un objectif hebdomadaire et compte les actions', async () => {
    const { user } = rendreApp('/plus')
    await user.type(screen.getByRole('textbox', { name: 'Nouvel objectif' }), 'Proposer l’assurance')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    await user.click(screen.getByRole('button', { name: 'Ajouter 1 à Proposer l’assurance' }))
    await user.click(screen.getByRole('button', { name: 'Ajouter 1 à Proposer l’assurance' }))
    expect(screen.getByLabelText('Progression de Proposer l’assurance')).toHaveTextContent('2 / 3')
    const [objectif] = JSON.parse(localStorage.getItem(CLE)!).objectifs
    expect(objectif.historique).toEqual({ '2026-W41': 2 })
  })

  it('rappelle d’exporter dès qu’il y a des données', async () => {
    const { user } = rendreApp('/plus')
    expect(screen.queryByText(/jamais exporté/)).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Nouvel objectif' }), 'X')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(screen.getByText(/jamais exporté/)).toBeInTheDocument()
  })

  it('importe une sauvegarde valide après confirmation, en gardant une copie', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = rendreApp('/plus')
    const sauvegarde = {
      ...etatVide(),
      objectifs: [{ id: 'o1', libelle: 'Relancer', cible: 2, historique: { '2026-W41': 1 } }],
    }
    const fichier = new File([serialiser(sauvegarde)], 'coach.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('Fichier de sauvegarde à importer'), fichier)

    expect(await screen.findByRole('status')).toHaveTextContent('Sauvegarde importée.')
    expect(screen.getByRole('heading', { name: 'Relancer' })).toBeInTheDocument()
    expect(Object.keys(localStorage).some((k) => k.startsWith(`${CLE}.avant-import-`))).toBe(true)
  })

  it('refuse un fichier invalide sans toucher aux données', async () => {
    const confirmer = vi.spyOn(window, 'confirm')
    const { user } = rendreApp('/plus')
    await user.type(screen.getByRole('textbox', { name: 'Nouvel objectif' }), 'Garder')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    await user.upload(
      screen.getByLabelText('Fichier de sauvegarde à importer'),
      new File(['{"version": 1}'], 'x.json', { type: 'application/json' }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(/invalide/)
    expect(confirmer).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Garder' })).toBeInTheDocument()
  })

  it('exporte et note la date du dernier export', async () => {
    // jsdom n'implémente pas les URL d'objets.
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const { user } = rendreApp('/plus')
    await user.click(screen.getByRole('button', { name: 'Exporter' }))
    expect(clic).toHaveBeenCalled()
    expect(await screen.findByRole('status')).toHaveTextContent('Sauvegarde exportée.')
    expect(within(screen.getByRole('region', { name: 'Sauvegarde' })).getByText(/Dernier export : 5 octobre 2026/)).toBeInTheDocument()
  })
})
