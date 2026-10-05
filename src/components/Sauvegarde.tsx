import { DownloadSimple, UploadSimple, Warning } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { useEtat } from '../etat/contexte'
import { ErreurEtat } from '../lib/etat'
import { lireSauvegarde, nomFichier, proposerFichier, rappelSauvegarde, serialiser } from '../lib/sauvegarde'

const formatDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

type Message = { type: 'ok' | 'erreur'; texte: string }

export default function Sauvegarde({ maintenant }: { maintenant: Date }) {
  const { etat, importer, marquerExport } = useEtat()
  const champFichier = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<Message | null>(null)

  const exporter = async () => {
    setMessage(null)
    const date = new Date()
    if (await proposerFichier(serialiser(etat), nomFichier(date))) {
      marquerExport()
      setMessage({ type: 'ok', texte: 'Sauvegarde exportée.' })
    }
  }

  const choisirFichier = async (fichier: File | undefined) => {
    setMessage(null)
    if (!fichier) return
    try {
      const nouveau = lireSauvegarde(await fichier.text())
      if (!window.confirm('Remplacer toutes mes données actuelles par cette sauvegarde ? (Une copie de l’état actuel est gardée.)')) {
        return
      }
      importer(nouveau)
      setMessage({ type: 'ok', texte: 'Sauvegarde importée.' })
    } catch (e) {
      setMessage({ type: 'erreur', texte: e instanceof ErreurEtat ? e.message : 'Impossible de lire ce fichier.' })
    } finally {
      if (champFichier.current) champFichier.current.value = ''
    }
  }

  return (
    <section aria-labelledby="sauvegarde" className="flex flex-col gap-2.5">
      <h2 id="sauvegarde" className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
        Sauvegarde
      </h2>
      <p className="text-sm text-text-muted">
        Tout reste sur ce téléphone. Exporte de temps en temps vers « Fichiers » → iCloud Drive.
        {etat.dernierExport && <> Dernier export : {formatDate.format(new Date(etat.dernierExport))}.</>}
      </p>

      {rappelSauvegarde(etat, maintenant) && (
        <p className="flex gap-2 rounded-input bg-exemple-soft p-3 text-sm text-exemple">
          <Warning size={18} className="shrink-0" aria-hidden />
          {etat.dernierExport ? 'Ta dernière sauvegarde a plus d’un mois.' : 'Tu n’as encore jamais exporté de sauvegarde.'}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={exporter}
          className="flex flex-1 items-center justify-center gap-2 rounded-control bg-accent py-3 font-semibold text-bg"
        >
          <DownloadSimple size={18} weight="bold" aria-hidden />
          Exporter
        </button>
        <button
          type="button"
          onClick={() => champFichier.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-control border border-border py-3 font-medium"
        >
          <UploadSimple size={18} aria-hidden />
          Importer
        </button>
        <input
          ref={champFichier}
          type="file"
          accept="application/json,.json"
          aria-label="Fichier de sauvegarde à importer"
          className="hidden"
          onChange={(e) => choisirFichier(e.target.files?.[0])}
        />
      </div>

      {message && (
        <p role="status" className={`text-sm ${message.type === 'ok' ? 'text-success' : 'text-danger'}`}>
          {message.texte}
        </p>
      )}
    </section>
  )
}
