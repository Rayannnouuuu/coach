# Coach Conseil — Spécification de design

- **Date** : 2026-10-05
- **Statut** : à relire (validé oralement en 3 parties, en attente de relecture écrite)
- **Utilisateur** : un seul — moi, conseiller bancaire, usage personnel

## 1. Objectif

Une PWA mobile (iPhone / Safari) pour m'entraîner seul aux entretiens de vente
et dépasser l'hésitation à proposer des produits (assurance, épargne et
placements, crédit à la consommation).

L'app me donne, au bon moment :

- avant un rendez-vous, une trame de découverte pour savoir quoi demander ;
- pour chaque produit, des accroches et des questions qui ouvrent la discussion ;
- pour chaque objection, des réponses prêtes à dire ;
- un entraînement court par cartes (répétition espacée) pour que tout ça
  devienne naturel ;
- la possibilité de réécrire chaque phrase avec mes propres mots.

## 2. Contraintes non négociables

| Contrainte | Conséquence |
|---|---|
| **Aucune donnée client** | Pas de champ nom, numéro, montant client, notes de RDV. Rien qui identifie une personne. |
| **Pas d'IA, pas d'API, pas de backend** | Site 100 % statique. Aucun appel réseau à l'exécution, en dehors du chargement de l'app elle-même. |
| **Contenu en Markdown** | Le contenu vit dans `/contenu/`. Je le remplis moi-même ; l'app ne livre que des exemples marqués **EXEMPLE**. |
| **Stockage 100 % local** | `localStorage`, un seul objet versionné. Sauvegarde par export/import JSON. |
| **Un seul utilisateur** | Pas de comptes, pas de synchro, pas de partage. |
| **Hébergement public (GitHub Pages)** | Acceptable : le contenu n'est pas confidentiel (déjà public sur les sources officielles de la banque). Rien de personnel ni d'interne n'est versionné. |

## 3. Stack technique

Identique au site guitare, pour ne rien réapprendre :

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- React Router (HashRouter, compatible GitHub Pages sans config serveur)
- Vitest + Testing Library + jsdom
- oxlint
- `vite-plugin-pwa` (Workbox) pour le manifeste et le cache hors ligne
- Chargement du Markdown au build via `import.meta.glob('/contenu/**/*.md', { query: '?raw', eager: true })`
  et un petit parseur maison (front-matter + sections) — pas de dépendance lourde.

## 4. Architecture et modèle de données

### 4.1 Contenu (`/contenu/`, versionné, en lecture seule dans l'app)

```
contenu/
  avant/            trames de découverte (avant RDV)
    decouverte-generale.md
  produits/         une fiche par produit
    assurance-habitation.md
    epargne-assurance-vie.md
    credit-conso.md
  objections/       une fiche par objection
    je-vais-reflechir.md
    deja-ailleurs.md
    pas-le-temps.md
```

Format d'une fiche :

```markdown
---
id: credit-conso
titre: Crédit à la consommation
type: produit            # avant | produit | objection
tags: [credit, projet]
exemple: true            # affiche le badge EXEMPLE tant que je n'ai pas remplacé le contenu
---

## Accroches
- Vous avez un projet en tête pour les mois qui viennent ?

## Questions de découverte
- ...

## Arguments
- ...

## À éviter
- ...
```

Règles :

- Chaque élément de liste (`- ...`) est une **phrase** adressable :
  identifiant stable = `{id de la fiche}/{slug de la section}/{index}`.
- `exemple: true` → badge **EXEMPLE** visible sur la fiche et ses cartes.
- Sections inconnues : affichées telles quelles, pas d'erreur.
- Une fiche invalide (front-matter manquant, `id` en double) fait échouer
  **le build et les tests**, pas l'app en production.

### 4.2 État local (`localStorage`, clé `coach-conseil`)

Un seul objet JSON :

```ts
type Etat = {
  version: 1;                         // version du schéma, pour migrations
  reecritures: Record<PhraseId, Reecriture[]>; // historique, la dernière = active
  cartes: Record<PhraseId, Carte>;     // progression d'entraînement
  objectifs: Objectif[];
  maj: string;                         // ISO date de dernière modification
};

type Reecriture = { texte: string; date: string };

type Carte = {
  boite: 0 | 1 | 2 | 3 | 4 | 5;       // système de Leitner
  prochaine: string;                   // ISO date de prochaine révision
  vues: number;
};

type Objectif = {
  id: string;
  libelle: string;                     // ex. « Proposer l'assurance 3 fois cette semaine »
  cible: number;
  fait: number;
  semaine: string;                     // ISO de l'année-semaine, ex. 2026-W41
};
```

- Les objectifs comptent des **actions de ma part**, jamais des clients.
- Lecture/écriture centralisées dans un module `stockage.ts` (testé) ;
  aucun composant n'accède directement à `localStorage`.
- Si le JSON est corrompu ou d'une version inconnue : on ne l'écrase pas,
  on le copie sous `coach-conseil.sauvegarde-<date>` et on repart d'un état vide
  avec un message.
- Migrations : fonction pure `migrer(ancien) → Etat`, une étape par version.

### 4.3 Phrase affichée

`texteAffiche(phraseId) = dernière réécriture ?? texte du Markdown`.
Si une phrase disparaît du Markdown, ses réécritures restent dans l'état
(non affichées) pour ne rien perdre ; elles réapparaissent si l'id revient.

## 5. Navigation et écrans

Barre d'onglets en bas, 5 onglets, pouce-friendly :

| Onglet | Rôle |
|---|---|
| **Avant** | Trames de découverte à relire juste avant un RDV. Lecture rapide, gros texte. |
| **Produits** | Liste des fiches produit → fiche détaillée par sections (accroches, questions, arguments, à éviter). |
| **Objections** | Liste des objections, recherche par mot-clé → réponses. Pensé pour une consultation en 5 secondes. |
| **S'entraîner** | Session de cartes du jour (répétition espacée). |
| **Plus** | Objectifs de la semaine, sauvegarde (export/import), à propos, version. |

### 5.1 Cartes contextuelles

Chaque phrase est rendue dans une carte. Selon l'écran :

- **Avant / Produits / Objections** : texte, badge EXEMPLE si applicable,
  indicateur « réécrite » si j'ai ma propre version.
- **S'entraîner** : recto = contexte (ex. « Objection : je vais réfléchir »),
  verso = ma réponse. Je réponds à voix haute, je retourne, je m'auto-évalue.

### 5.2 Mode « Mon discours » (réécriture)

- Bouton « Réécrire » sur chaque phrase → éditeur plein écran simple
  (textarea, texte d'origine affiché au-dessus pour référence).
- Enregistrer ajoute une entrée à l'historique (`reecritures`).
- Historique consultable ; « Revenir à l'original » et « Restaurer cette
  version » ajoutent une nouvelle entrée (rien n'est supprimé).
- Filtre « Mon discours » pour ne voir que les phrases réécrites.

### 5.3 Entraînement (S'entraîner)

- Système de Leitner à 6 boîtes, intervalles : 0, 1, 3, 7, 14, 30 jours.
- Auto-évaluation : **À revoir** (retour boîte 0), **Hésitant** (même boîte),
  **Naturel** (boîte +1).
- Session du jour = cartes dues, limitée à 15 par défaut, objections
  prioritaires.
- Filtre par type (produits / objections) et par tag.
- Les cartes EXEMPLE sont incluses tant que je n'ai rien d'autre, avec le badge.

### 5.4 Plus

- **Objectifs** : objectifs hebdomadaires, bouton « +1 », remise à zéro
  automatique au changement de semaine (historique des semaines passées conservé).
- **Sauvegarde** : export / import JSON (voir §6.3).
- **À propos** : version de l'app, date du contenu, rappel « aucune donnée client ».

## 6. PWA, hors ligne, sauvegarde, déploiement

### 6.1 PWA

- `vite-plugin-pwa`, stratégie `generateSW`, précache de tous les assets
  (le contenu Markdown est compilé dans le bundle, donc hors ligne d'office).
- Manifeste : nom « Coach Conseil », `display: standalone`, couleurs de thème,
  icônes 192/512 + `apple-touch-icon` 180.
- iOS : `viewport-fit=cover`, marges `env(safe-area-inset-*)` (encoche et
  barre d'accueil), `apple-mobile-web-app-capable`, barre d'état adaptée.
- Aucune requête réseau à l'exécution hors mise à jour du service worker.

### 6.2 Mises à jour

- `registerType: 'prompt'` : quand une nouvelle version est disponible,
  bandeau discret « Nouvelle version disponible — Mettre à jour ».
- Jamais de rechargement forcé (je peux être en pleine lecture avant un RDV).

### 6.3 Export / import

- **Export** : télécharge `coach-conseil-AAAA-MM-JJ.json` (l'objet `Etat`
  complet). Sur iPhone, passe par la feuille de partage → « Enregistrer dans
  Fichiers » → iCloud Drive.
- **Import** : sélection de fichier, puis validation stricte
  (structure, `version`, types). En cas d'erreur : message clair, état actuel
  intact.
- Avant tout import, l'état actuel est automatiquement copié sous
  `coach-conseil.avant-import-<date>`.
- Rappel discret dans « Plus » si la dernière sauvegarde date de plus de
  30 jours.

### 6.4 Déploiement

- GitHub Actions : à chaque push sur `main` → `npm ci`, lint, tests, build,
  publication sur GitHub Pages.
- Le build échoue si un test échoue ou si une fiche Markdown est invalide.
- `base` Vite réglé sur `/coach/`.

## 7. Tests

- **Unitaires** : parseur Markdown, identifiants de phrases, `stockage.ts`
  (lecture, écriture, corruption, migration), Leitner, objectifs (changement
  de semaine), validation d'import.
- **Contenu** : un test charge tout `/contenu/` et vérifie front-matter, ids
  uniques, types valides.
- **Composants** : rendu des écrans principaux, flux réécriture, flux
  d'une carte d'entraînement, export/import.

## 8. Livraison en 7 étapes

Chaque étape est courte, testable, et laisse l'app dans un état utilisable.

1. **Squelette** — projet Vite/React/TS/Tailwind/Vitest, modèle de données,
   `stockage.ts`, parseur, contenu EXEMPLE, tests.
2. **Écrans en lecture** — navigation 5 onglets, Avant, Produits, Objections.
3. **Mon discours** — réécriture, historique, filtre.
4. **S'entraîner** — cartes, Leitner, session du jour.
5. **Plus** — objectifs hebdomadaires, export/import.
6. **PWA** — manifeste, icônes, hors ligne, bandeau de mise à jour.
7. **Déploiement** — GitHub Actions → Pages + guide d'installation sur iPhone
   (Safari → Partager → Sur l'écran d'accueil).

## 9. Hors périmètre

- Toute donnée client, CRM, prise de notes de RDV.
- IA, génération de texte, appels à une API.
- Synchronisation multi-appareils automatique (l'export iCloud suffit).
- Comptes, multi-utilisateurs, partage.
- Statistiques de vente réelles.
