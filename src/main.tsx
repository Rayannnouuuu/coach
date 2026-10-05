import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import App from './App.tsx'
import { EtatProvider } from './etat/EtatProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EtatProvider>
      <App />
    </EtatProvider>
  </StrictMode>,
)
