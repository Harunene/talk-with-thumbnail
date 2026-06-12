import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { getCharacterSpritePath, isCharacterId } from '@/lib/characters';
import { parseFaceCropParam } from '@/lib/debug/thumbnailLayout';
import { renderSpriteWithFaceRect } from '@/lib/debug/spriteRectOverlay';
import { referenceExpressionId } from '@/lib/portraitMatch';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type') ?? 'hikari';
  if (!isCharacterId(typeParam)) {
    return new Response('Invalid character type', { status: 400 });
  }

  const faceCrop = parseFaceCropParam(searchParams.get('faceCrop'));
  if (!faceCrop) {
    return new Response('faceCrop=left,top,width,height required', { status: 400 });
  }

  const centered = searchParams.get('centered') === '1';
  const expression = searchParams.get('expr') ?? referenceExpressionId(typeParam);
  const relativePath = getCharacterSpritePath(typeParam, expression, undefined, { centered });
  const spritePath = path.join(process.cwd(), 'public', relativePath);

  try {
    await fs.access(spritePath);
  } catch {
    return new Response(`Sprite not found: ${relativePath}`, { status: 404 });
  }

  const png = await renderSpriteWithFaceRect(spritePath, faceCrop);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=120',
    },
  });
}
