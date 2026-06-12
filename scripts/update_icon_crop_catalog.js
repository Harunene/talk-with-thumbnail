import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { preparePortraitFile } from '../lib/detectFaceFromPortrait.ts';
import { runFaceIconDetector } from '../lib/detectFaceIcon.ts';
import { referenceSpritePath } from '../lib/portraitMatch.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

const SOURCE_DIR = 'public/images/bluearchive/char_small';
const CENTERED_DIR = 'public/images/bluearchive/char_small_centered';
const CATALOG_PATH = 'lib/characterCatalog.ts';

function formatCrop(crop) {
  return `{ left: ${Math.round(crop.left)}, top: ${Math.round(crop.top)}, width: ${Math.round(crop.width)}, height: ${Math.round(crop.height)} }`;
}

async function loadPadLeft(characterId) {
  try {
    const raw = await fs.readFile(path.join(CENTERED_DIR, characterId, '.centered.json'), 'utf8');
    return JSON.parse(raw).padLeft ?? 0;
  } catch {
    return 0;
  }
}

async function detectCharacter(characterId) {
  const entry = CHARACTER_CATALOG[characterId];
  const charDir = path.join(SOURCE_DIR, characterId);
  const files = (await fs.readdir(charDir)).filter((f) => f.endsWith('.png')).sort();
  const spritePath = referenceSpritePath(characterId, charDir, files);
  const portraitPath = await preparePortraitFile(entry.wikiPrefix);
  if (!portraitPath) {
    return { characterId, error: 'no portrait' };
  }

  const result = await runFaceIconDetector(spritePath, portraitPath);
  const padLeft = await loadPadLeft(characterId);
  const iconCrop = {
    left: result.iconCrop.left + padLeft,
    top: result.iconCrop.top,
    width: result.iconCrop.width,
    height: result.iconCrop.height,
  };

  return {
    characterId,
    ref: path.basename(spritePath),
    iconCrop,
    formatted: formatCrop(iconCrop),
    siftScore: result.siftScore,
    faceScore: result.faceScore,
  };
}

async function main() {
  let catalog = await fs.readFile(CATALOG_PATH, 'utf8');
  const results = await mapPool(CHARACTER_IDS, Math.min(4, DEFAULT_CONCURRENCY), detectCharacter);

  for (const result of results) {
    if (!result || result.error) {
      console.warn(`${result?.characterId ?? '?'}: skip (${result?.error ?? 'unknown'})`);
      continue;
    }

    const { characterId, iconCrop, formatted, ref, siftScore, faceScore } = result;
    const iconRe = new RegExp(`(${characterId}:\\s*\\{[\\s\\S]*?iconCrop:\\s*)\\{[^}]+\\}`, 'm');
    const faceRe = new RegExp(`(${characterId}:\\s*\\{[\\s\\S]*?faceCrop:\\s*\\{[^}]+\\},)`, 'm');

    if (iconRe.test(catalog)) {
      catalog = catalog.replace(iconRe, `$1${formatted}`);
    } else if (faceRe.test(catalog)) {
      catalog = catalog.replace(faceRe, `$1\n    iconCrop: ${formatted},`);
    } else {
      console.warn(`${characterId}: faceCrop block not found`);
      continue;
    }

    const centerY = iconCrop.top + iconCrop.height / 2;
    console.log(
      `${characterId}: icon=${Math.round(iconCrop.width)}x${Math.round(iconCrop.height)} ` +
        `@${Math.round(iconCrop.left)},${Math.round(iconCrop.top)} centerY=${centerY.toFixed(1)} ` +
        `ref=${ref} sift=${siftScore.toFixed(3)} face=${faceScore.toFixed(3)}`,
    );
  }

  await fs.writeFile(CATALOG_PATH, catalog);
  console.log(`\nUpdated ${CATALOG_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
