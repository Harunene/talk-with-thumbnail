import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { CHARACTER_CATALOG, CHARACTER_IDS } from '../lib/characterCatalog.ts';
import {
  ensureWikiPortrait,
  portraitFileName,
  WIKI_PORTRAITS_DIR,
} from '../lib/wikiPortraits.ts';

async function main() {
  const manifest = [];

  for (const characterId of CHARACTER_IDS) {
    const entry = CHARACTER_CATALOG[characterId];
    const portraitPath = await ensureWikiPortrait(entry.wikiPrefix);
    if (!portraitPath) {
      console.warn(`${characterId}: portrait download failed`);
      continue;
    }

    const meta = await sharp(portraitPath).metadata();
    const fileName = portraitFileName(entry.wikiPrefix);
    manifest.push({
      wikiPrefix: entry.wikiPrefix,
      fileName,
      wikiUrl: `https://bluearchive.wiki/wiki/Special:FilePath/${encodeURIComponent(fileName)}`,
      width: meta.width ?? null,
      height: meta.height ?? null,
      downloadedAt: new Date().toISOString(),
    });

    console.log(`${characterId}: ${fileName} ${meta.width}x${meta.height}`);
  }

  await fs.writeFile(
    path.join(WIKI_PORTRAITS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`\n${manifest.length} portraits in ${WIKI_PORTRAITS_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
