import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const CHARACTERS = ['hikari', 'nozomi', 'aoba', 'aris', 'kei', 'momoi'];
const SOURCE_DIR = 'public/images/bluearchive/char_small';
const TARGET_DIR = 'public/images/bluearchive/char_face';

// lib/characters.ts faceCrop 과 동기화
const CROP_CONFIG = {
  hikari: {
    left: 171,
    top: 103,
    width: 100,
    height: 100,
  },
  nozomi: {
    left: 171,
    top: 108,
    width: 100,
    height: 100,
  },
  aris: {
    left: 292,
    top: 80,
    width: 100,
    height: 100,
  },
  aoba: {
    left: 146,
    top: 88,
    width: 100,
    height: 100,
  },
  kei: {
    left: 543,
    top: 86,
    width: 100,
    height: 100,
  },
  momoi: {
    left: 392,
    top: 90,
    width: 100,
    height: 100,
  },
};

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function cropFaces() {
  for (const character of CHARACTERS) {
    const sourceCharDir = path.join(SOURCE_DIR, character);
    const targetCharDir = path.join(TARGET_DIR, character);

    await ensureDir(targetCharDir);

    const files = await fs.readdir(sourceCharDir);

    for (const file of files) {
      if (!file.endsWith('.png')) continue;

      const sourcePath = path.join(sourceCharDir, file);
      const targetPath = path.join(targetCharDir, file);

      console.log(`Processing ${sourcePath}...`);

      try {
        await sharp(sourcePath)
          .extract(CROP_CONFIG[character])
          .toFile(targetPath);

        console.log(`Created ${targetPath}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

cropFaces().catch(console.error);
