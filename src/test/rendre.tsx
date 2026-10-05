import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { EtatProvider } from '../etat/EtatProvider'

/** Rend l'app complète à une adresse donnée, avec un état lu depuis localStorage. */
export function rendreApp(chemin = '/') {
  const user = userEvent.setup()
  const rendu = render(
    <MemoryRouter initialEntries={[chemin]}>
      <EtatProvider>
        <App />
      </EtatProvider>
    </MemoryRouter>,
  )
  return { user, ...rendu }
}
