#!/usr/bin/env node
/**
 * generate-icons.js
 *
 * Generates all PWA icons from the source SVG in public/icon.svg.
 * Outputs:
 *   public/icon-192.png   (192x192, manifest)
 *   public/icon-512.png   (512x512, manifest)
 *   public/apple-touch-icon.png (180x180, iOS home screen)
 *   public/favicon.ico    (32x32, browser tab)
 *
 * Usage:  node scripts/generate-icons.js
 * Requires: sharp (npm install --save-dev sharp)
 */

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const PUBLIC = path.join(__dirname, '..', 'public')
const SVG_PATH = path.join(PUBLIC, 'icon.svg')

const SIZES = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 },
]

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('Missing source SVG at public/icon.svg')
    process.exit(1)
  }

  const svg = fs.readFileSync(SVG_PATH)

  for (const { name, size } of SIZES) {
    const outPath = path.join(PUBLIC, name)
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`  ✓ ${name} (${size}x${size})`)
  }

  console.log('\nAll icons generated in public/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
