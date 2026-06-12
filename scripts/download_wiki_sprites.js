import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CHARACTER_CATALOG,
  CHARACTER_IDS,
  getDefaultVariant,
  getWikiSpriteIndices,
} from '../lib/characterCatalog.ts';

const WIKI_BASE = 'https://bluearchive.wiki/wiki/Special:FilePath/';
const OUTPUT_DIR = 'public/images/bluearchive/char_small';
const TARGET_HEIGHT = 768;

const onlyIds = process.argv.slice(2);

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

async function processCharacterEntry(entry, variant) {
  const folderName =
    variant.id === entry.defaultVariantId || variant.id === 'default'
      ? entry.id
      : `${entry.id}--${variant.id}`;
  const outDir = path.join(OUTPUT_DIR, folderName);
  await fs.mkdir(outDir, { recursive: true });

  const wikiPrefix = variant.wikiPrefix ?? entry.wikiPrefix;
  const indices = getWikiSpriteIndices(entry);

  for (let i = 0; i < indices.length; i++) {
    const wikiIndex = indices[i];
    const expression = String(i + 1).padStart(3, '0');
    const outFile = `up_${entry.id}_${expression}.png`;
    const outPath = path.join(outDir, outFile);

    console.log(`Downloading ${wikiPrefix}_${String(wikiIndex).padStart(2, '0')}.png -> ${folderName}/${outFile}`);
    const buffer = await downloadSprite(wikiPrefix, wikiIndex);

    await sharp(buffer)
      .resize({ height: TARGET_HEIGHT, withoutEnlargement: true })
      .toFile(outPath);
  }
}

for (const characterId of CHARACTER_IDS) {
  if (onlyIds.length > 0 && !onlyIds.includes(characterId)) continue;

  const entry = CHARACTER_CATALOG[characterId];
  const defaultVariant = getDefaultVariant(entry);
  await processCharacterEntry(entry, defaultVariant);
}

console.log('Done.');
