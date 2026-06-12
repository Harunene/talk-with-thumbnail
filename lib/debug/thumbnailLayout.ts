import type { CharacterFaceCrop } from '@/lib/characterCatalog';

import {
  getThumbnailBottomOffsetPx,
  getThumbnailCharHeightPx,
  THUMBNAIL_REFERENCE_HEIGHT_CM,
  THUMBNAIL_BASE_HEIGHT_PERCENT,
  THUMBNAIL_ZOOM_HEIGHT_PERCENT,
  THUMBNAIL_VIEWPORT_HEIGHT_PX,
} from '@/lib/thumbnailScale';

export const OG_WIDTH = 600;
export const OG_HEIGHT = THUMBNAIL_VIEWPORT_HEIGHT_PX;
export const DEFAULT_SPRITE_HEIGHT = 768;

export interface ThumbnailLayoutOptions {
  zoomMode?: boolean;
  heightCm?: number;
  faceCropTop?: number;
  thumbnailOffsetXPercent?: number;
}

export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function resolveHeightScale(options: ThumbnailLayoutOptions) {
  if (!options.heightCm) return 1;
  return options.heightCm / THUMBNAIL_REFERENCE_HEIGHT_CM;
}

export function getThumbnailCharacterLayout(
  spriteWidth: number,
  spriteHeight: number,
  options: ThumbnailLayoutOptions = {},
) {
  const zoomMode = options.zoomMode ?? false;
  const heightCm = options.heightCm ?? THUMBNAIL_REFERENCE_HEIGHT_CM;
  const heightScale = resolveHeightScale(options);
  const basePercent = zoomMode ? THUMBNAIL_ZOOM_HEIGHT_PERCENT : THUMBNAIL_BASE_HEIGHT_PERCENT;
  const charHeight = options.heightCm
    ? getThumbnailCharHeightPx(heightCm, zoomMode, OG_HEIGHT)
    : OG_HEIGHT * (basePercent / 100);
  const baseBottom = getThumbnailBottomOffsetPx(heightCm, zoomMode, {
    faceCropTop: options.faceCropTop,
    spriteHeight,
    viewportHeightPx: OG_HEIGHT,
  });
  const leftPercent = 50 + (options.thumbnailOffsetXPercent ?? 0);
  const scale = charHeight / spriteHeight;
  const displayWidth = spriteWidth * scale;
  const spriteLeft = (OG_WIDTH * leftPercent) / 100 - displayWidth / 2;
  const spriteTop = OG_HEIGHT - baseBottom - charHeight;

  return {
    scale,
    displayWidth,
    charHeight,
    spriteLeft,
    spriteTop,
    leftPercent,
    baseBottom,
    heightScale,
  };
}

export function projectFaceCropToViewport(
  faceCrop: CharacterFaceCrop,
  spriteWidth: number,
  spriteHeight: number,
  options: ThumbnailLayoutOptions = {},
): ViewportRect {
  const layout = getThumbnailCharacterLayout(spriteWidth, spriteHeight, {
    ...options,
    faceCropTop: options.faceCropTop ?? faceCrop.top,
  });
  return {
    x: Math.round(layout.spriteLeft + faceCrop.left * layout.scale),
    y: Math.round(layout.spriteTop + faceCrop.top * layout.scale),
    width: Math.round(faceCrop.width * layout.scale),
    height: Math.round(faceCrop.height * layout.scale),
  };
}

export function parseFaceCropParam(value: string | null | undefined): CharacterFaceCrop | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return undefined;
  const [left, top, width, height] = parts;
  return { left, top, width, height };
}

export function formatFaceCropParam(faceCrop: CharacterFaceCrop): string {
  return `${faceCrop.left},${faceCrop.top},${faceCrop.width},${faceCrop.height}`;
}

export function faceCropDistance(
  a: CharacterFaceCrop | null | undefined,
  b: CharacterFaceCrop | null | undefined,
): number | null {
  if (!a || !b) return null;
  return Math.hypot(a.left - b.left, a.top - b.top);
}
