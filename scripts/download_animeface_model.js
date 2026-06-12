import fs from 'node:fs/promises';
import path from 'node:path';

const MODEL_URL =
  'https://github.com/Fuyucch1/yolov8_animeface/releases/download/v1/yolov8x6_animeface.pt';
const OUTPUT = path.join(import.meta.dirname, '../models/anime-face/yolov8x6_animeface.pt');

async function main() {
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });

  try {
    await fs.access(OUTPUT);
    console.log(`Already exists: ${OUTPUT}`);
    return;
  } catch {
    // download
  }

  console.log(`Downloading ${MODEL_URL}`);
  const response = await fetch(MODEL_URL);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(OUTPUT, buffer);
  console.log(`Saved ${OUTPUT} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
