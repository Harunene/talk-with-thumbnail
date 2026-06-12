import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { detectFaceFromPortrait } from '../lib/detectFaceFromPortrait.ts';
import { referenceSpritePath } from '../lib/portraitMatch.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

/** wiki/다운로드 원본. 절대 덮어쓰지 않음 */
const SOURCE_DIR = 'public/images/bluearchive/char_small';
/** 투명 패딩 적용 결과 */
const OUTPUT_DIR = 'public/images/bluearchive/char_small_centered';
const MATCH_MIN_SCORE = 0.12;

function computeHorizontalPadding(width, faceCenterX) {
  const half = width / 2;
  if (Math.abs(faceCenterX - half) < 0.5) {
    return { padLeft: 0, padRight: 0, newWidth: width };
  }
  if (faceCenterX < half) {
    const padLeft = Math.round(width - 2 * faceCenterX);
    return { padLeft, padRight: 0, newWidth: width + padLeft };
  }
  const padRight = Math.round(2 * faceCenterX - width);
  return { padLeft: 0, padRight, newWidth: width + padRight };
}

async function resolveFaceAnchor(character, entry) {
  const charDir = path.join(SOURCE_DIR, character);
  const files = (await fs.readdir(charDir)).filter((file) => file.endsWith('.png')).sort();
  if (files.length === 0) {
    throw new Error(`${character}: no sprites`);
  }

  const samplePath = referenceSpritePath(character, charDir, files);
  const portraitMatch = await detectFaceFromPortrait(samplePath, entry.wikiPrefix);
  if (!portraitMatch || portraitMatch.score < MATCH_MIN_SCORE) {
    throw new Error(
      `${character}: SIFT portrait match failed (score ${portraitMatch?.score?.toFixed(3) ?? 'n/a'})`,
    );
  }

  return {
    anchorX: portraitMatch.anchorX,
    faceCrop: portraitMatch.faceCrop,
    method: 'sift',
    score: portraitMatch.score,
  };
}

async function centerCharacterSprites(character, anchor) {
  const sourceCharDir = path.join(SOURCE_DIR, character);
  const outputCharDir = path.join(OUTPUT_DIR, character);
  const markerPath = path.join(outputCharDir, '.centered.json');

  await fs.mkdir(outputCharDir, { recursive: true });

  const files = (await fs.readdir(sourceCharDir)).filter((file) => file.endsWith('.png'));
  if (files.length === 0) {
    console.log(`${character}: skip (no sprites)`);
    return null;
  }

  const samplePath = path.join(sourceCharDir, files[0]);
  const sample = await sharp(samplePath).metadata();
  const width = sample.width ?? 0;
  const crop = anchor.faceCrop;

  const { padLeft, padRight, newWidth } = computeHorizontalPadding(width, anchor.anchorX);

  const faceCropKey = (value) =>
    `${value.left},${value.top},${value.width},${value.height}`;

  let existingMarker = null;
  try {
    existingMarker = JSON.parse(await fs.readFile(markerPath, 'utf8'));
    const nextCenteredCrop = { ...crop, left: crop.left + padLeft };
    if (
      existingMarker.sourceWidth === width &&
      existingMarker.padLeft === padLeft &&
      existingMarker.padRight === padRight &&
      existingMarker.method === anchor.method &&
      faceCropKey(existingMarker.faceCrop ?? {}) === faceCropKey(nextCenteredCrop)
    ) {
      console.log(`${character}: skip (centered output up to date, ${anchor.method})`);
      return existingMarker;
    }
  } catch {
    // regenerate
  }

  if (padLeft === 0 && padRight === 0) {
    console.log(`${character}: already centered in source (${width}px), copying as-is`);
  } else {
    console.log(
      `${character}: [${anchor.method}] ${width}px -> ${newWidth}px (padLeft=${padLeft}, padRight=${padRight})`,
    );
  }

  for (const file of files) {
    const sourcePath = path.join(sourceCharDir, file);
    const outputPath = path.join(outputCharDir, file);

    if (padLeft === 0 && padRight === 0) {
      await fs.copyFile(sourcePath, outputPath);
      continue;
    }

    await sharp(sourcePath)
      .extend({
        left: padLeft,
        right: padRight,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(outputPath);
  }

  const centeredFaceCrop = {
    ...crop,
    left: crop.left + padLeft,
  };
  const centeredAnchorX = anchor.anchorX + padLeft;

  const marker = {
    sourceWidth: width,
    spriteReferenceWidth: padLeft === 0 && padRight === 0 ? width : newWidth,
    faceCrop: centeredFaceCrop,
    width: padLeft === 0 && padRight === 0 ? width : newWidth,
    anchorX: centeredAnchorX,
    padLeft,
    padRight,
    method: anchor.method,
    matchScore: anchor.score,
    sourceDir: sourceCharDir,
    outputDir: outputCharDir,
  };

  await fs.writeFile(markerPath, JSON.stringify(marker, null, 2));
  return marker;
}

const onlyIds = process.argv.slice(2);
const targets = onlyIds.length > 0 ? onlyIds : CHARACTER_IDS;

const results = {};
await mapPool(targets, Math.min(4, DEFAULT_CONCURRENCY), async (character) => {
  const entry = CHARACTER_CATALOG[character];
  if (!entry) return;

  const charDir = path.join(SOURCE_DIR, character);
  try {
    await fs.access(charDir);
  } catch {
    console.log(`${character}: skip (missing folder)`);
    return;
  }

  const anchor = await resolveFaceAnchor(character, entry);
  results[character] = await centerCharacterSprites(character, anchor);
});

console.log('\nCentered output -> char_small_centered/ (originals preserved in char_small/):');
for (const [character, result] of Object.entries(results)) {
  if (!result) continue;
  const { spriteReferenceWidth, faceCrop, padLeft, padRight, method, anchorX } = result;
  console.log(
    `${character}: [${method}] width=${spriteReferenceWidth}, anchorX=${Number(anchorX).toFixed(1)}, pad L/R=${padLeft}/${padRight}, faceCrop left=${faceCrop.left}`,
  );
}
