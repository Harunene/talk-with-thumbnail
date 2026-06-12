import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { preparePortraitFile, runPortraitMatcher } from '../lib/detectFaceFromPortrait.ts';
import { referenceSpritePath } from '../lib/portraitMatch.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

const CENTERED_DIR = 'public/images/bluearchive/char_small_centered';
const SOURCE_DIR = 'public/images/bluearchive/char_small';
const CATALOG_PATH = 'lib/characterCatalog.ts';

function formatFaceCrop(crop, anchorX) {
  const parts = [
    `left: ${crop.left}`,
    `top: ${crop.top}`,
    `width: ${crop.width}`,
    `height: ${crop.height}`,
  ];
  if (anchorX != null && Math.abs(anchorX - (crop.left + crop.width / 2)) > 0.5) {
    parts.push(`anchorX: ${Math.round(anchorX)}`);
  }
  return `{ ${parts.join(', ')} }`;
}

async function matchCharacter(characterId) {
  const entry = CHARACTER_CATALOG[characterId];
  const centeredDir = path.join(CENTERED_DIR, characterId);
  const sourceDir = path.join(SOURCE_DIR, characterId);
  const charDir = await fs.access(centeredDir).then(() => centeredDir).catch(() => sourceDir);
  const files = (await fs.readdir(charDir)).filter((f) => f.endsWith('.png')).sort();
  const spritePath = referenceSpritePath(characterId, charDir, files);
  const portraitPath = await preparePortraitFile(entry.wikiPrefix);
  if (!portraitPath) {
    return { characterId, error: 'no portrait' };
  }

  const match = await runPortraitMatcher(spritePath, portraitPath);
  return {
    characterId,
    ref: path.basename(spritePath),
    match,
    faceCrop: match.faceCrop,
    formatted: formatFaceCrop(match.faceCrop, match.anchorX),
  };
}

async function main() {
  let catalog = await fs.readFile(CATALOG_PATH, 'utf8');
  const results = await mapPool(CHARACTER_IDS, DEFAULT_CONCURRENCY, matchCharacter);
  const summary = [];

  for (const result of results) {
    if (!result || result.error) {
      console.warn(`${result?.characterId ?? '?'}: skip (${result?.error ?? 'unknown'})`);
      continue;
    }

    const { characterId, match, faceCrop, formatted, ref } = result;
    const blockRe = new RegExp(
      `(${characterId}:\\s*\\{[\\s\\S]*?faceCrop:\\s*)\\{[^}]+\\}`,
      'm',
    );
    if (!blockRe.test(catalog)) {
      console.warn(`${characterId}: faceCrop block not found`);
      continue;
    }
    catalog = catalog.replace(blockRe, `$1${formatted}`);

    const widthRe = new RegExp(
      `(${characterId}:\\s*\\{[\\s\\S]*?spriteReferenceWidth:\\s*)\\d+`,
      'm',
    );
    if (widthRe.test(catalog)) {
      catalog = catalog.replace(widthRe, `$1${match.spriteWidth}`);
    }

    summary.push({
      id: characterId,
      ref,
      method: match.method,
      score: match.score,
      scale: match.scale,
      faceCrop,
      spriteWidth: match.spriteWidth,
    });

    console.log(
      `${characterId}: ${faceCrop.width}x${faceCrop.height}@${faceCrop.left},${faceCrop.top} ` +
        `score=${match.score.toFixed(3)} ref=${ref}`,
    );
  }

  await fs.writeFile(CATALOG_PATH, catalog);
  console.log(`\nUpdated ${CATALOG_PATH} (${summary.length} characters)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
