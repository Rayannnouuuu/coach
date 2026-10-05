# Coach Conseil

PWA personnelle pour m'entraîner aux entretiens de conseil bancaire :
trames de découverte, fiches produits, réponses aux objections, réécriture
avec mes propres mots et entraînement par cartes (répétition espacée).

**Aucune donnée client, aucune IA, aucune API, aucun serveur.** Le contenu
est en Markdown dans [`contenu/`](contenu/), tout le reste (réécritures,
progression, objectifs) reste dans le téléphone et s'exporte en JSON.

- Site : https://rayannnouuuu.github.io/coach/
- [Installer sur l'iPhone](docs/installer-sur-iphone.md)
- [Remplir le contenu](docs/contenu.md)
- [Spécification](docs/specs/2026-10-05-coach-conseil-design.md)

## Développer

```bash
npm install
npm run dev      # http://localhost:5173/coach/
npm test         # tests (dont la validation de tout /contenu/)
npm run lint
npm run build
```

Chaque push sur `main` lance lint, tests et build, puis publie sur GitHub
Pages ([workflow](.github/workflows/deploy.yml)).
