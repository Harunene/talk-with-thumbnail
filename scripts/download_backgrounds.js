import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { BACKGROUNDS_WITH_WIKI } from '../lib/backgrounds.ts';

const WIKI_BASE = 'https://bluearchive.wiki/wiki/Special:FilePath/';
const OUTPUT_DIR = 'public/images/bluearchive/bg';
const TARGET_WIDTH = 1600;

async function downloadBackground(background) {
  if (!background.wikiFile) return;

  const url = `${WIKI_BASE}${encodeURIComponent(background.wikiFile)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; talk-with-thumbnail/1.0)' },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${background.wikiFile}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(OUTPUT_DIR, background.file);

  await sharp(buffer)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toFile(outPath);

  console.log(`${background.wikiFile} -> ${background.file}`);
}

await fs.mkdir(OUTPUT_DIR, { recursive: true });

for (const background of BACKGROUNDS_WITH_WIKI) {
  await downloadBackground(background);
}

console.log('Done.');
