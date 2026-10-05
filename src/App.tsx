import { contenu } from './lib/contenu'

export default function App() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Coach Conseil</h1>
      <p className="mt-2 text-text-muted">{contenu.fiches.length} fiches chargées.</p>
    </main>
  )
}
