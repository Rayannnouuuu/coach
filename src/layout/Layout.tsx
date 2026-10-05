import { Warning, X } from '@phosphor-icons/react'
import { Outlet } from 'react-router-dom'
import TabBar from '../components/TabBar'
import { useEtat } from '../etat/contexte'

export default function Layout() {
  const { avertissement, fermerAvertissement } = useEtat()
  return (
    <div className="min-h-dvh">
      <main
        className="mx-auto max-w-xl px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        {avertissement && (
          <div role="alert" className="mb-4 flex gap-3 rounded-card bg-danger-soft p-4 text-sm text-danger">
            <Warning size={20} className="shrink-0" aria-hidden />
            <p className="flex-1">{avertissement}</p>
            <button type="button" onClick={fermerAvertissement} aria-label="Fermer l’avertissement">
              <X size={18} />
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
