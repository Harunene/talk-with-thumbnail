import sharp from 'sharp';

export interface SpriteFaceCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export async function renderSpriteWithFaceRect(
  spritePath: string,
  faceCrop: SpriteFaceCrop,
): Promise<Buffer> {
  const meta = await sharp(spritePath).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid sprite dimensions: ${spritePath}`);
  }

  const { left, top, width: cropW, height: cropH } = faceCrop;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${left}" y="${top}" width="${cropW}" height="${cropH}"
    fill="rgba(255,77,79,0.18)" stroke="#ff4d4f" stroke-width="3"/>
</svg>`;

  return sharp(spritePath)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}
