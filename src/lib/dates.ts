const deuxChiffres = (n: number) => String(n).padStart(2, '0')

/** Date locale au format AAAA-MM-JJ (pas d'UTC : on raisonne en journées du téléphone). */
export function jour(d: Date): string {
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`
}

export function ajouterJours(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Semaine ISO 8601 locale, ex. « 2026-W41 ». */
export function semaineISO(d: Date): string {
  // Calcul en UTC sur la date locale, pour échapper aux changements d'heure.
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const jourSemaine = t.getUTCDay() || 7 // lundi = 1 … dimanche = 7
  t.setUTCDate(t.getUTCDate() + 4 - jourSemaine) // jeudi de la même semaine
  const annee = t.getUTCFullYear()
  const semaine = Math.ceil(((t.getTime() - Date.UTC(annee, 0, 1)) / 86_400_000 + 1) / 7)
  return `${annee}-W${deuxChiffres(semaine)}`
}

export function joursEntre(a: Date, b: Date): number {
  const debut = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const fin = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((fin.getTime() - debut.getTime()) / 86_400_000)
}
