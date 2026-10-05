// Génère les icônes PNG de la PWA à partir d'un SVG, avec Chromium (Playwright).
// Usage : node scripts/generer-icones.mjs   (nécessite playwright installé)
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

// Fond plein bord à bord (iOS et Android arrondissent eux-mêmes) ;
// le pictogramme tient dans la zone sûre des icônes « maskable » (80 %).
const svg = (taille) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0b1015"/>
  <g transform="translate(256 256) scale(1.15) translate(-256 -248)">
    <path d="M136 168c0-26 21-48 48-48h144c27 0 48 22 48 48v104c0 27-21 48-48 48h-72l-64 56v-56h-8c-27 0-48-21-48-48z" fill="#2dd4bf"/>
    <path d="M208 220l32 32 64-64" fill="none" stroke="#0b1015" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

const sorties = [
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
]

const navigateur = await chromium.launch()
const page = await navigateur.newPage()
for (const [chemin, taille] of sorties) {
  await page.setViewportSize({ width: taille, height: taille })
  await page.setContent(`<html><body style="margin:0">${svg(taille)}</body></html>`)
  writeFileSync(chemin, await page.screenshot({ omitBackground: false }))
  console.log(chemin)
}
await navigateur.close()
