/** 히카리(147)·아리스(152) 기준 — 현재 OG 150% 배율이 적당하다고 본 구간 */
export const THUMBNAIL_REFERENCE_HEIGHT_CM = (147 + 152) / 2;
/** 히카리 머리 위치·세로 보정 기준 */
export const THUMBNAIL_BASELINE_HEIGHT_CM = 147;
/** 천장 여유 기준 최대 키 */
export const THUMBNAIL_CEILING_HEIGHT_CM = 180;
/** char_small_centered 히카리 SIFT faceCrop.top */
export const THUMBNAIL_BASELINE_FACE_TOP = 83;
export const THUMBNAIL_BASE_HEIGHT_PERCENT = 150;
export const THUMBNAIL_ZOOM_HEIGHT_PERCENT = 200;
export const THUMBNAIL_BASE_BOTTOM_PX = -180;
export const THUMBNAIL_ZOOM_BOTTOM_PX = -320;
export const THUMBNAIL_VIEWPORT_HEIGHT_PX = 315;
/** 180cm일 때 머리 top이 닿지 않도록 두는 천장 여백 */
export const THUMBNAIL_MIN_HEAD_TOP_PX = 8;
export const THUMBNAIL_DEFAULT_SPRITE_HEIGHT = 768;

export function getThumbnailCharHeightPx(
  heightCm: number,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const base = zoomMode ? THUMBNAIL_ZOOM_HEIGHT_PERCENT : THUMBNAIL_BASE_HEIGHT_PERCENT;
  return viewportHeightPx * (base / 100) * (heightCm / THUMBNAIL_REFERENCE_HEIGHT_CM);
}

export function getThumbnailHeightScale(heightCm: number, zoomMode = false): number {
  const base = zoomMode ? THUMBNAIL_ZOOM_HEIGHT_PERCENT : THUMBNAIL_BASE_HEIGHT_PERCENT;
  return (base / 100) * (heightCm / THUMBNAIL_REFERENCE_HEIGHT_CM);
}

export function getThumbnailHeightPercent(heightCm: number, zoomMode = false): string {
  const base = zoomMode ? THUMBNAIL_ZOOM_HEIGHT_PERCENT : THUMBNAIL_BASE_HEIGHT_PERCENT;
  const percent = base * (heightCm / THUMBNAIL_REFERENCE_HEIGHT_CM);
  return `${percent}%`;
}

/** 히카리(147cm, bottom -180) 기준 머리 Y */
export function getThumbnailReferenceHeadY(
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const baseBottom = zoomMode ? THUMBNAIL_ZOOM_BOTTOM_PX : THUMBNAIL_BASE_BOTTOM_PX;
  const charHeight = getThumbnailCharHeightPx(THUMBNAIL_BASELINE_HEIGHT_CM, zoomMode, viewportHeightPx);
  const scale = charHeight / THUMBNAIL_DEFAULT_SPRITE_HEIGHT;
  const spriteTop = viewportHeightPx - baseBottom - charHeight;
  return spriteTop + THUMBNAIL_BASELINE_FACE_TOP * scale;
}

/**
 * 147cm → 히카리 머리 Y, 180cm → 천장 여백(THUMBNAIL_MIN_HEAD_TOP_PX) 선형 보간.
 * 147cm 미만은 히카리와 동일 머리 높이.
 */
export function getThumbnailTargetHeadY(
  heightCm: number,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const referenceHeadY = getThumbnailReferenceHeadY(zoomMode, viewportHeightPx);
  if (heightCm <= THUMBNAIL_BASELINE_HEIGHT_CM) {
    return referenceHeadY;
  }

  const clampedHeight = Math.min(heightCm, THUMBNAIL_CEILING_HEIGHT_CM);
  const t =
    (clampedHeight - THUMBNAIL_BASELINE_HEIGHT_CM) /
    (THUMBNAIL_CEILING_HEIGHT_CM - THUMBNAIL_BASELINE_HEIGHT_CM);
  return referenceHeadY + t * (THUMBNAIL_MIN_HEAD_TOP_PX - referenceHeadY);
}

export interface ThumbnailBottomOffsetOptions {
  faceCropTop?: number;
  spriteHeight?: number;
  viewportHeightPx?: number;
}

/** faceCrop.top 기준으로 targetHeadY에 맞춘 bottom px */
export function getThumbnailBottomOffsetPx(
  heightCm: number,
  zoomMode = false,
  options: ThumbnailBottomOffsetOptions = {},
): number {
  const viewportHeightPx = options.viewportHeightPx ?? THUMBNAIL_VIEWPORT_HEIGHT_PX;
  const spriteHeight = options.spriteHeight ?? THUMBNAIL_DEFAULT_SPRITE_HEIGHT;
  const faceCropTop = options.faceCropTop ?? THUMBNAIL_BASELINE_FACE_TOP;
  const charHeight = getThumbnailCharHeightPx(heightCm, zoomMode, viewportHeightPx);
  const scale = charHeight / spriteHeight;
  const targetHeadY = getThumbnailTargetHeadY(heightCm, zoomMode, viewportHeightPx);

  return viewportHeightPx - charHeight + faceCropTop * scale - targetHeadY;
}
