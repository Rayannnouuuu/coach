import type { Fiche } from '../lib/markdown'
import PhraseCarte from './PhraseCarte'

export default function FicheVue({ fiche, grand = false }: { fiche: Fiche; grand?: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      {fiche.sections.map((section) => (
        <section key={section.slug} aria-labelledby={`s-${section.slug}`}>
          <h2
            id={`s-${section.slug}`}
            className="mb-2.5 text-xs font-semibold tracking-[0.08em] text-text-muted uppercase"
          >
            {section.titre}
          </h2>
          {section.notes.map((note, i) => (
            <p key={i} className="mb-2.5 text-[0.9375rem] leading-relaxed text-text-muted">
              {note}
            </p>
          ))}
          {section.phrases.length > 0 && (
            <ul className="flex flex-col gap-2">
              {section.phrases.map((p) => (
                <PhraseCarte key={p.id} phrase={p} grand={grand} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
