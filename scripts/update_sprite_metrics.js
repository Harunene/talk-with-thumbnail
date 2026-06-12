import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { referenceSpritePath } from '../lib/portraitMatch.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

const CENTERED_DIR = 'public/images/bluearchive/char_small_centered';
const CATALOG_PATH = 'lib/characterCatalog.ts';

/** 앉은 포즈 — span 정규화 제외 */
const SEATED_CHARACTERS = new Set(['nagisa']);

async function measureFootY(imagePath) {
  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + (channels - 1)];
      if (alpha > 16) return y;
    }
  }

  return height - 1;
}

async function measureCharacter(characterId) {
  const charDir = path.join(CENTERED_DIR, characterId);
  const files = (await fs.readdir(charDir)).filter((f) => f.endsWith('.png')).sort();
  const spritePath = referenceSpritePath(characterId, charDir, files);
  const footY = await measureFootY(spritePath);
  const pose = SEATED_CHARACTERS.has(characterId) ? 'seated' : 'standing';

  const entry = CHARACTER_CATALOG[characterId];
  const iconCrop = entry.iconCrop;
  const faceCy = iconCrop ? iconCrop.top + iconCrop.height / 2 : null;
  const span = faceCy != null ? footY - faceCy : null;

  return { characterId, footY, pose, span, ref: path.basename(spritePath) };
}

function upsertCatalogField(catalog, characterId, field, value) {
  const fieldRe = new RegExp(`(${characterId}:\\s*\\{[\\s\\S]*?${field}:\\s*)[^,\\n]+`, 'm');
  if (fieldRe.test(catalog)) {
    return catalog.replace(fieldRe, `$1${value}`);
  }

  const heightRe = new RegExp(`(${characterId}:\\s*\\{[\\s\\S]*?heightCm:\\s*\\d+,)`, 'm');
  if (heightRe.test(catalog)) {
    return catalog.replace(heightRe, `$1\n    ${field}: ${value},`);
  }

  return catalog;
}

async function main() {
  let catalog = await fs.readFile(CATALOG_PATH, 'utf8');
  const results = await mapPool(CHARACTER_IDS, Math.min(4, DEFAULT_CONCURRENCY), measureCharacter);

  for (const result of results) {
    if (!result) continue;

    const { characterId, footY, pose, span, ref } = result;
    catalog = upsertCatalogField(catalog, characterId, 'footY', footY);
    catalog = upsertCatalogField(catalog, characterId, 'pose', `'${pose}'`);

    console.log(
      `${characterId}: footY=${footY} pose=${pose}` +
        `${span != null ? ` span=${span.toFixed(1)}` : ''} ref=${ref}`,
    );
  }

  await fs.writeFile(CATALOG_PATH, catalog);
  console.log(`\nUpdated ${CATALOG_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
