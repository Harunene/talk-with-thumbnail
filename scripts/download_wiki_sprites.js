import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const WIKI_BASE = 'https://bluearchive.wiki/wiki/Special:FilePath/';
const OUTPUT_DIR = 'public/images/bluearchive/char_small';
const TARGET_HEIGHT = 768;

/** Wiki gallery uses {Name}_{NN}.png; we store up_{id}_{NNN}.png */
const CHARACTERS = [
  { id: 'momoi', wikiPrefix: 'Momoi', indices: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  {
    id: 'kei',
    wikiPrefix: 'Kei',
    indices: Array.from({ length: 30 }, (_, i) => i),
  },
  {
    id: 'aoba',
    wikiPrefix: 'Aoba',
    indices: Array.from({ length: 29 }, (_, i) => i),
  },
];

async function downloadSprite(wikiPrefix, index) {
  const wikiFile = `${wikiPrefix}_${String(index).padStart(2, '0')}.png`;
  const url = `${WIKI_BASE}${encodeURIComponent(wikiFile)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; talk-with-thumbnail/1.0)' },
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${wikiFile}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function processCharacter({ id, wikiPrefix, indices }) {
  const outDir = path.join(OUTPUT_DIR, id);
  await fs.mkdir(outDir, { recursive: true });

  for (let i = 0; i < indices.length; i++) {
    const wikiIndex = indices[i];
    const expression = String(i + 1).padStart(3, '0');
    const outFile = `up_${id}_${expression}.png`;
    const outPath = path.join(outDir, outFile);

    console.log(`Downloading ${wikiPrefix}_${String(wikiIndex).padStart(2, '0')}.png -> ${outFile}`);
    const buffer = await downloadSprite(wikiPrefix, wikiIndex);

    await sharp(buffer)
      .resize({ height: TARGET_HEIGHT, withoutEnlargement: true })
      .toFile(outPath);
  }
}

for (const character of CHARACTERS) {
  await processCharacter(character);
}

console.log('Done.');
