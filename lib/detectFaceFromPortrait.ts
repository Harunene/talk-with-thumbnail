import path from 'node:path';
import { spawn } from 'node:child_process';
import { ensureWikiPortrait } from './wikiPortraits';

const MATCH_SCRIPT = path.join(import.meta.dirname, '../scripts/match_portrait_face.py');

export interface PortraitFaceCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PortraitMatchResult {
  score: number;
  rawScore?: number;
  goodMatches?: number;
  inliers?: number;
  inlierRatio?: number;
  scale: number;
  anchorX: number;
  faceTop: number;
  faceCrop: PortraitFaceCrop;
  spriteWidth: number;
  spriteHeight: number;
  portraitFile: string;
  portraitWidth: number;
  portraitHeight: number;
  method?: string;
  error?: string;
}

export async function preparePortraitFile(wikiPrefix: string): Promise<string | null> {
  return ensureWikiPortrait(wikiPrefix);
}

export function runPortraitMatcher(
  spritePath: string,
  portraitPath: string,
): Promise<PortraitMatchResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [MATCH_SCRIPT, '--sprite', spritePath, '--portrait', portraitPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Portrait matcher exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout.trim()) as PortraitMatchResult);
      } catch (error) {
        reject(new Error(`Invalid matcher output: ${stdout.trim()} (${String(error)})`));
      }
    });
  });
}

export async function detectFaceFromPortrait(
  spritePath: string,
  wikiPrefix: string,
): Promise<PortraitMatchResult | null> {
  const portraitPath = await preparePortraitFile(wikiPrefix);
  if (!portraitPath) return null;

  try {
    const result = await runPortraitMatcher(spritePath, portraitPath);
    if ('error' in result && result.error) return null;
    if (result.score < 0.12) return null;
    return {
      ...result,
      portraitFile: path.basename(portraitPath),
    };
  } catch {
    return null;
  }
}

export function computeHorizontalPadding(width: number, faceCenterX: number) {
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

export async function centerSpriteBuffer(
  spriteBuffer: Buffer,
  faceCenterX: number,
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(spriteBuffer).metadata();
  const width = meta.width ?? 0;
  const { padLeft, padRight } = computeHorizontalPadding(width, faceCenterX);
  if (padLeft === 0 && padRight === 0) return spriteBuffer;

  return sharp(spriteBuffer)
    .extend({
      left: padLeft,
      right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}
