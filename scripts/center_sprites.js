import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCE_DIR = 'public/images/bluearchive/char_small';

/** 패딩 전 얼굴 크롭. anchorX 가 있으면 얼굴 대신 해당 X를 썸네일 중앙 기준으로 사용 */
const FACE_CROP = {
  hikari: { left: 171, top: 103, width: 100, height: 100 },
  nozomi: { left: 145, top: 108, width: 100, height: 100 },
  aris: { left: 292, top: 80, width: 100, height: 100 },
  aoba: { left: 146, top: 88, width: 100, height: 100 },
  // 총 등 오른쪽 무게 때문에 전체 COM 대신 상체(55%) 중심 사용
  // 1126px 기준 face 중앙(563) + 비대칭 padLeft 30px → 1156px, faceCrop.left 543
  kei: { left: 543, top: 86, width: 100, height: 100, anchorX: 593 },
  momoi: { left: 392, top: 90, width: 100, height: 100 },
};

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

async function centerCharacterSprites(character, crop) {
  const charDir = path.join(SOURCE_DIR, character);
  const markerPath = path.join(charDir, '.centered.json');
  const files = (await fs.readdir(charDir)).filter((file) => file.endsWith('.png'));
  const samplePath = path.join(charDir, files[0]);
  const sample = await sharp(samplePath).metadata();
  const width = sample.width;

  try {
    const marker = JSON.parse(await fs.readFile(markerPath, 'utf8'));
    if (marker.width === width) {
      console.log(`${character}: skip (${width}px, already centered)`);
      return marker;
    }
    console.log(`${character}: width changed (${marker.width} -> ${width}), re-centering`);
  } catch {
    // not centered yet
  }

  const anchorX = crop.anchorX ?? crop.left + crop.width / 2;
  const { padLeft, padRight, newWidth } = computeHorizontalPadding(width, anchorX);

  if (padLeft === 0 && padRight === 0) {
    const marker = {
      spriteReferenceWidth: width,
      faceCrop: crop,
      width,
      anchorX,
    };
    await fs.writeFile(markerPath, JSON.stringify(marker, null, 2));
    console.log(`${character}: already centered (${width}px)`);
    return marker;
  }

  console.log(
    `${character}: ${width}px -> ${newWidth}px (padLeft=${padLeft}, padRight=${padRight})`,
  );

  for (const file of files) {
    const sourcePath = path.join(charDir, file);
    const targetPath = path.join(charDir, `.tmp_${file}`);
    await sharp(sourcePath)
      .extend({
        left: padLeft,
        right: padRight,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(targetPath);
    await fs.rename(targetPath, sourcePath);
  }

  const marker = {
    spriteReferenceWidth: newWidth,
    faceCrop: {
      ...crop,
      left: crop.left + padLeft,
    },
    width: newWidth,
    anchorX,
  };
  await fs.writeFile(markerPath, JSON.stringify(marker, null, 2));
  return marker;
}

const results = {};
for (const [character, crop] of Object.entries(FACE_CROP)) {
  results[character] = await centerCharacterSprites(character, crop);
}

console.log('\nUpdated config:');
for (const [character, { spriteReferenceWidth, faceCrop }] of Object.entries(results)) {
  console.log(
    `${character}: spriteReferenceWidth=${spriteReferenceWidth}, faceCrop={ left: ${faceCrop.left}, top: ${faceCrop.top}, width: ${faceCrop.width}, height: ${faceCrop.height} }`,
  );
}
