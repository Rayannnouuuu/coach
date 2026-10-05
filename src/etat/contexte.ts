import { createContext, useContext } from 'react'
import type { Etat } from '../lib/etat'
import type { Note } from '../lib/leitner'

export type ActionsEtat = {
  reecrire: (phraseId: string, original: string, texte: string | null) => void
  evaluerCarte: (phraseId: string, note: Note) => void
  ajouterObjectif: (libelle: string, cible: number) => void
  ajusterObjectif: (id: string, delta: number) => void
  supprimerObjectif: (id: string) => void
  /** Remplace tout l'état ; l'état actuel est mis de côté avant. */
  importer: (etat: Etat) => void
  marquerExport: () => void
  fermerAvertissement: () => void
}

export type ValeurEtat = ActionsEtat & {
  etat: Etat
  avertissement: string | null
}

export const ContexteEtat = createContext<ValeurEtat | null>(null)

export function useEtat(): ValeurEtat {
  const valeur = useContext(ContexteEtat)
  if (!valeur) throw new Error('useEtat doit être utilisé sous <EtatProvider>')
  return valeur
}
