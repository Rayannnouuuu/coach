import { Barbell, ChatsCircle, DotsThree, Package, Sun, type Icon } from '@phosphor-icons/react'
import { NavLink } from 'react-router-dom'

const ONGLETS: Array<{ vers: string; libelle: string; Icone: Icon }> = [
  { vers: '/avant', libelle: 'Avant', Icone: Sun },
  { vers: '/produits', libelle: 'Produits', Icone: Package },
  { vers: '/objections', libelle: 'Objections', Icone: ChatsCircle },
  { vers: '/entrainement', libelle: 'S’entraîner', Icone: Barbell },
  { vers: '/plus', libelle: 'Plus', Icone: DotsThree },
]

export default function TabBar() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-xl">
        {ONGLETS.map(({ vers, libelle, Icone }) => (
          <li key={vers} className="flex-1">
            <NavLink
              to={vers}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[0.6875rem] font-medium ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                  {libelle}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
