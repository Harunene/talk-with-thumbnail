import fs from 'node:fs/promises';
import path from 'node:path';

export const WIKI_PORTRAITS_DIR = path.join(import.meta.dirname, '../public/wiki-portraits');
const WIKI_BASE = 'https://bluearchive.wiki/wiki/Special:FilePath/';

export interface WikiPortraitManifestEntry {
  wikiPrefix: string;
  fileName: string;
  wikiUrl: string;
  width: number | null;
  height: number | null;
  downloadedAt: string;
}

async function downloadWikiFile(fileName: string): Promise<Buffer | null> {
  const url = `${WIKI_BASE}${encodeURIComponent(fileName)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; talk-with-thumbnail/1.0)' },
    redirect: 'follow',
  });
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

export function portraitFileName(wikiPrefix: string): string {
  return `Portrait_${wikiPrefix}.png`;
}

export function portraitFilePath(wikiPrefix: string): string {
  return path.join(WIKI_PORTRAITS_DIR, portraitFileName(wikiPrefix));
}

export async function ensureWikiPortrait(wikiPrefix: string): Promise<string | null> {
  await fs.mkdir(WIKI_PORTRAITS_DIR, { recursive: true });

  const primaryName = portraitFileName(wikiPrefix);
  const primaryPath = path.join(WIKI_PORTRAITS_DIR, primaryName);

  try {
    await fs.access(primaryPath);
    return primaryPath;
  } catch {
    // cache miss
  }

  for (const fileName of [primaryName, `${wikiPrefix}.png`]) {
    const buffer = await downloadWikiFile(fileName);
    if (!buffer) continue;

    const targetPath = path.join(WIKI_PORTRAITS_DIR, fileName);
    await fs.writeFile(targetPath, buffer);
    return targetPath;
  }

  return null;
}
