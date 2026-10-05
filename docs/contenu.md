# Remplir le contenu

Tout le contenu de l'app est dans `contenu/`, un fichier Markdown par fiche :

- `contenu/avant/` : trames à relire avant un rendez-vous
- `contenu/produits/` : une fiche par produit
- `contenu/objections/` : une fiche par objection

## Format

```markdown
---
id: credit-conso          # unique, minuscules, chiffres et tirets
titre: Crédit à la consommation
type: produit             # avant | produit | objection
tags: [credit, projet]    # facultatif, sert de filtre à l'entraînement
exemple: true             # badge EXEMPLE ; passe à false (ou supprime) quand c'est ton contenu
ordre: 3                  # facultatif, ordre dans la liste
---

## Accroches
Une ligne sans tiret est une consigne : elle s'affiche mais ne devient pas une carte.
- Chaque ligne qui commence par un tiret est une phrase.
- Chaque phrase devient une carte d'entraînement et peut être réécrite dans l'app.
```

## À savoir

- **Jamais de donnée client** dans ces fichiers : le dépôt et le site sont publics.
- L'identifiant d'une phrase dépend de la fiche, de la section et de sa
  position (`credit-conso/accroches/0`). Si tu insères une phrase au milieu
  d'une section, les réécritures et la progression des phrases suivantes se
  décalent. Ajoute plutôt les nouvelles phrases en fin de section.
- Une fiche mal formée fait échouer `npm test` et le déploiement, avec le nom
  du fichier en cause : le site en ligne n'est jamais cassé.
