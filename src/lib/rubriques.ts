import type { TypeFiche } from './markdown'

export const RUBRIQUES: Record<TypeFiche, { chemin: string; titre: string; intro: string }> = {
  avant: { chemin: '/avant', titre: 'Avant le RDV', intro: 'À relire juste avant de recevoir.' },
  produit: { chemin: '/produits', titre: 'Produits', intro: 'Accroches, questions et arguments par produit.' },
  objection: { chemin: '/objections', titre: 'Objections', intro: 'Quoi répondre, en 5 secondes.' },
}

export const cheminFiche = (type: TypeFiche, id: string) => `${RUBRIQUES[type].chemin}/${id}`
export const cheminReecrire = (phraseId: string) => `/reecrire?p=${encodeURIComponent(phraseId)}`
