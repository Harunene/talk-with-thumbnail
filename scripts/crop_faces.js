import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import { preparePortraitFile } from '../lib/detectFaceFromPortrait.ts';
import { runFaceIconDetector } from '../lib/detectFaceIcon.ts';
import { referenceSpriteFile } from '../lib/portraitMatch.ts';
import { DEFAULT_CONCURRENCY, mapPool } from './batchPool.js';

const SOURCE_DIR = 'public/images/bluearchive/char_small';
const TARGET_DIR = 'public/images/bluearchive/char_face';
const CONCURRENCY = DEFAULT_CONCURRENCY;
const FACE_ICON_PX = 100;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function clampCropToSprite(crop, spriteWidth, spriteHeight) {
  const width = Math.max(1, Math.min(spriteWidth, Math.round(crop.width)));
  const height = Math.max(1, Math.min(spriteHeight, Math.round(crop.height)));
  const left = Math.max(0, Math.min(spriteWidth - width, Math.round(crop.left)));
  const top = Math.max(0, Math.min(spriteHeight - height, Math.round(crop.top)));
  return { left, top, width, height };
}

async function cropCharacter(character) {
  const entry = CHARACTER_CATALOG[character];
  if (!entry) {
    console.warn(`Unknown character: ${character}`);
    return;
  }

  const spriteCharDir = path.join(SOURCE_DIR, character);
  const targetCharDir = path.join(TARGET_DIR, character);

  try {
    await fs.access(spriteCharDir);
  } catch {
    console.log(`${character}: skip (missing sprites)`);
    return;
  }

  const portraitPath = await preparePortraitFile(entry.wikiPrefix);
  if (!portraitPath) {
    console.warn(`${character}: skip (portrait not found)`);
    return;
  }

  await ensureDir(targetCharDir);
  const files = (await fs.readdir(spriteCharDir)).filter((file) => file.endsWith('.png')).sort();
  const refFile = referenceSpriteFile(character, files);
  const refPath = path.join(spriteCharDir, refFile);

  const { iconCrop, method, siftScore, faceScore, siftFaceCrop, faceBoxPatch } =
    await runFaceIconDetector(refPath, portraitPath);

  console.log(
    `${character}: ref=${refFile} [${method} sift=${siftScore.toFixed(3)} face=${faceScore.toFixed(3)}] ` +
      `sift=${Math.round(siftFaceCrop.width)}x${Math.round(siftFaceCrop.height)} ` +
      `face=${Math.round(faceBoxPatch.width)}x${Math.round(faceBoxPatch.height)} ` +
      `icon=${Math.round(iconCrop.width)}x${Math.round(iconCrop.height)} → ${files.length} files`,
  );

  const logs = await mapPool(files, CONCURRENCY, async (file) => {
    const sourcePath = path.join(spriteCharDir, file);
    const targetPath = path.join(targetCharDir, file);

    const meta = await sharp(sourcePath).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const { left, top, width: cropW, height: cropH } = clampCropToSprite(iconCrop, width, height);

    await sharp(sourcePath)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(FACE_ICON_PX, FACE_ICON_PX, { fit: 'fill' })
      .toFile(targetPath);

    return `  ${file}: left=${left} top=${top} ${cropW}x${cropH}`;
  });

  for (const line of logs.sort()) {
    console.log(line);
  }
}

async function cropFaces() {
  const onlyIds = process.argv.slice(2);
  const targets = onlyIds.length > 0 ? onlyIds : CHARACTER_IDS;

  await mapPool(targets, Math.min(4, CONCURRENCY), async (character) => {
    await cropCharacter(character);
  });
}

cropFaces().catch(console.error);
