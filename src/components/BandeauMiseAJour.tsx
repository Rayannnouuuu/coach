import { useRegisterSW } from 'virtual:pwa-register/react'

/** Propose la nouvelle version sans jamais recharger de force (je peux être en pleine lecture). */
export default function BandeauMiseAJour() {
  const {
    needRefresh: [miseAJour, setMiseAJour],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, enregistrement) {
      // Vérifie les nouvelles versions à chaque retour sur l'app et toutes les heures.
      if (!enregistrement) return
      const verifier = () => enregistrement.update().catch(() => {})
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && verifier())
      setInterval(verifier, 60 * 60 * 1000)
    },
  })

  if (!miseAJour) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 z-30 mx-auto flex max-w-xl items-center gap-3 rounded-card border border-accent/40 bg-panel-raised p-3 pl-4 shadow-2xl"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)' }}
    >
      <p className="flex-1 text-sm">Nouvelle version disponible.</p>
      <button type="button" onClick={() => setMiseAJour(false)} className="px-2 py-2 text-sm text-text-muted">
        Plus tard
      </button>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-bg"
      >
        Mettre à jour
      </button>
    </div>
  )
}
