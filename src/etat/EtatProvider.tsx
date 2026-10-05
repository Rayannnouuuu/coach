import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Etat } from '../lib/etat'
import { evaluer } from '../lib/leitner'
import { creerObjectif, incrementer } from '../lib/objectifs'
import { ajouterReecriture } from '../lib/reecritures'
import { ecrireEtat, lireEtat, mettreDeCote } from '../lib/stockage'
import { ContexteEtat, type ActionsEtat } from './contexte'

export function EtatProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => lireEtat())
  const [etat, setEtat] = useState<Etat>(initial.etat)
  const [avertissement, setAvertissement] = useState(initial.avertissement)

  useEffect(() => {
    if (!ecrireEtat(etat)) {
      // L'échec vient du système externe (localStorage) : on le remonte une fois.
      // oxlint-disable-next-line react/set-state-in-effect
      setAvertissement('Impossible d’enregistrer sur ce téléphone (stockage plein ou navigation privée). Exporte une sauvegarde.')
    }
  }, [etat])

  const actions = useMemo<ActionsEtat>(() => {
    const modifier = (f: (e: Etat, maintenant: Date) => Etat) =>
      setEtat((e) => {
        const maintenant = new Date()
        const suivant = f(e, maintenant)
        return suivant === e ? e : { ...suivant, maj: maintenant.toISOString() }
      })

    return {
      reecrire: (phraseId, original, texte) =>
        modifier((e, maintenant) => {
          const historique = ajouterReecriture(original, e.reecritures[phraseId], texte, maintenant)
          if (historique === e.reecritures[phraseId] || historique.length === 0) return e
          return { ...e, reecritures: { ...e.reecritures, [phraseId]: historique } }
        }),
      evaluerCarte: (phraseId, note) =>
        modifier((e, maintenant) => ({
          ...e,
          cartes: { ...e.cartes, [phraseId]: evaluer(e.cartes[phraseId], note, maintenant) },
        })),
      ajouterObjectif: (libelle, cible) =>
        modifier((e, maintenant) =>
          libelle.trim() ? { ...e, objectifs: [...e.objectifs, creerObjectif(libelle, cible, maintenant)] } : e,
        ),
      ajusterObjectif: (id, delta) =>
        modifier((e, maintenant) => ({
          ...e,
          objectifs: e.objectifs.map((o) => (o.id === id ? incrementer(o, delta, maintenant) : o)),
        })),
      supprimerObjectif: (id) => modifier((e) => ({ ...e, objectifs: e.objectifs.filter((o) => o.id !== id) })),
      importer: (nouveau) =>
        setEtat((e) => {
          mettreDeCote(e, 'avant-import')
          return nouveau
        }),
      marquerExport: () => modifier((e, maintenant) => ({ ...e, dernierExport: maintenant.toISOString() })),
      fermerAvertissement: () => setAvertissement(null),
    }
  }, [])

  const valeur = useMemo(() => ({ etat, avertissement, ...actions }), [etat, avertissement, actions])
  return <ContexteEtat.Provider value={valeur}>{children}</ContexteEtat.Provider>
}
