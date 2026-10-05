import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CLE } from '../../lib/stockage'
import { rendreApp } from '../../test/rendre'

const PHRASE = 'Je comprends, le budget compte.'

describe('Mon discours', () => {
  beforeEach(() => localStorage.clear())

  it('réécrit une phrase, l’affiche partout et la sauvegarde', async () => {
    const { user } = rendreApp('/objections/trop-cher')
    await user.click(screen.getByRole('link', { name: `Réécrire : ${PHRASE}` }))

    expect(screen.getByText(PHRASE, { selector: 'p' })).toBeInTheDocument() // texte d'origine en référence
    const zone = screen.getByRole('textbox')
    expect(zone).toHaveValue(PHRASE)
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()

    await user.clear(zone)
    await user.type(zone, 'Je vous entends, parlons budget.')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByRole('heading', { level: 1, name: '« C\'est trop cher »' })).toBeInTheDocument()
    expect(screen.getByText('Je vous entends, parlons budget.')).toBeInTheDocument()
    expect(screen.queryByText(PHRASE)).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CLE)!).reecritures['trop-cher/accueillir/0']).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'Plus' }))
    await user.click(screen.getByRole('link', { name: 'Mon discours' }))
    expect(screen.getByText('Je vous entends, parlons budget.')).toBeInTheDocument()
  })

  it('revient à l’original et restaure une ancienne version sans rien effacer', async () => {
    const { user } = rendreApp('/reecrire?p=trop-cher%2Faccueillir%2F0')
    const zone = screen.getByRole('textbox')
    await user.clear(zone)
    await user.type(zone, 'Version A')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(screen.getByText('Version A')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Réécrire : Version A' }))
    await user.click(screen.getByRole('button', { name: 'Revenir au texte d’origine' }))
    expect(screen.getByText(PHRASE)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: `Réécrire : ${PHRASE}` }))
    expect(screen.getByRole('heading', { name: 'Historique' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restaurer' }))
    expect(screen.getByText('Version A')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CLE)!).reecritures['trop-cher/accueillir/0']).toHaveLength(3)
  })

  it('renvoie à l’accueil pour une phrase inconnue', () => {
    rendreApp('/reecrire?p=nimporte%2Fquoi%2F0')
    expect(screen.getByRole('heading', { level: 1, name: 'Avant le RDV' })).toBeInTheDocument()
  })
})
