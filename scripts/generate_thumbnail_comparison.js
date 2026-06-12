import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { preparePortraitFile, runPortraitMatcher } from '../lib/detectFaceFromPortrait.ts';
import { referenceSpritePath } from '../lib/portraitMatch.ts';
import { faceCropDistance } from '../lib/debug/thumbnailLayout.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

const OUTPUT_DIR = 'public/thumbnail-review';
const CENTERED_DIR = 'public/images/bluearchive/char_small_centered';
const SOURCE_DIR = 'public/images/bluearchive/char_small';

async function loadCenteredMarker(characterId) {
  try {
    const raw = await fs.readFile(
      path.join(CENTERED_DIR, characterId, '.centered.json'),
      'utf8',
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function resolveSpriteDir(characterId) {
  const centered = path.join(CENTERED_DIR, characterId);
  try {
    await fs.access(centered);
    return centered;
  } catch {
    return path.join(SOURCE_DIR, characterId);
  }
}

function summarizeMatch(match) {
  if (!match || match.error) {
    return {
      score: null,
      scale: null,
      method: match?.method ?? null,
      faceCrop: null,
      error: match?.error ?? 'match failed',
      goodMatches: null,
      inliers: null,
    };
  }

  return {
    score: Number(match.score.toFixed(3)),
    scale: Number(match.scale.toFixed(3)),
    method: match.method ?? null,
    faceCrop: match.faceCrop,
    goodMatches: match.goodMatches ?? null,
    inliers: match.inliers ?? null,
    inlierRatio: match.inlierRatio != null ? Number(match.inlierRatio.toFixed(3)) : null,
  };
}

async function buildRow(characterId) {
  const config = CHARACTER_CATALOG[characterId];
  const charDir = await resolveSpriteDir(characterId);
  const matchSpriteCentered = charDir.includes('char_small_centered');
  const files = (await fs.readdir(charDir)).filter((f) => f.endsWith('.png')).sort();
  const spritePath = referenceSpritePath(characterId, charDir, files);
  const portraitPath = await preparePortraitFile(config.wikiPrefix);

  let siftMatch = null;
  if (portraitPath) {
    try {
      siftMatch = await runPortraitMatcher(spritePath, portraitPath);
    } catch (error) {
      console.warn(`${characterId}: sift match failed`, error);
      siftMatch = { method: 'sift', error: error instanceof Error ? error.message : String(error) };
    }
  }

  const sift = summarizeMatch(siftMatch);
  const centeredMarker = await loadCenteredMarker(characterId);

  console.log(
    `${characterId}: sift=${sift.score ?? '-'} ref=${path.basename(spritePath)} ` +
      `catalogDist=${faceCropDistance(config.faceCrop, sift.faceCrop)?.toFixed(0) ?? '-'}px`,
  );

  return {
    id: characterId,
    name: config.name,
    defaultBackgroundId: config.defaultBackgroundId,
    referenceSprite: path.basename(spritePath),
    matchSpriteCentered,
    portraitFile: portraitPath ? path.basename(portraitPath) : null,
    sift,
    matchScore: sift.score,
    matchScale: sift.scale,
    matchMethod: sift.method,
    anchorX: siftMatch ? Number(siftMatch.anchorX.toFixed(1)) : null,
    catalogFaceCrop: config.faceCrop ?? null,
    portraitFaceCrop: sift.faceCrop,
    faceCropDistance: faceCropDistance(config.faceCrop, sift.faceCrop),
    centeredFaceCrop: centeredMarker?.faceCrop ?? null,
    centeredWidth: centeredMarker?.spriteReferenceWidth ?? null,
    centeredAnchorX: centeredMarker?.anchorX ?? null,
    padLeft: centeredMarker?.padLeft ?? null,
    padRight: centeredMarker?.padRight ?? null,
    centerMethod: centeredMarker?.method ?? null,
  };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const rows = await mapPool(CHARACTER_IDS, DEFAULT_CONCURRENCY, buildRow);
  await fs.writeFile(path.join(OUTPUT_DIR, 'results.json'), JSON.stringify(rows, null, 2));
  console.log(`\nOpen /thumbnail-review (${rows.length} characters)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
