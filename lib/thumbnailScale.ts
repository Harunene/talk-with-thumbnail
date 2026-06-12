import { CHARACTER_CATALOG } from './characterCatalog';
import type { CharacterFaceCrop } from './characterCatalog';

/** 히카리(147)·아리스(152) 기준 */
export const THUMBNAIL_REFERENCE_HEIGHT_CM = (147 + 152) / 2;
export const THUMBNAIL_BASELINE_HEIGHT_CM = 147;
/** 천장 보정 시작 키 */
export const THUMBNAIL_TALL_HEIGHT_CM = 165;
/** 천장 여유 기준 최대 키 */
export const THUMBNAIL_CEILING_HEIGHT_CM = 180;
/** char_small_centered 히카리 iconCrop 중심 Y */
export const THUMBNAIL_BASELINE_ICON_CENTER_Y = 167;
export const THUMBNAIL_BASE_HEIGHT_PERCENT = 150;
export const THUMBNAIL_ZOOM_HEIGHT_PERCENT = 220;
export const THUMBNAIL_BASE_BOTTOM_PX = -180;
export const THUMBNAIL_ZOOM_BOTTOM_PX = -320;
export const THUMBNAIL_VIEWPORT_HEIGHT_PX = 315;
/** 180cm일 때 얼굴 중심 Y */
export const THUMBNAIL_MIN_FACE_Y_PX = 52;
export const THUMBNAIL_DEFAULT_SPRITE_HEIGHT = 768;

export type CharacterPose = 'standing' | 'seated';

export interface ThumbnailSpriteMetrics {
  heightCm: number;
  pose?: CharacterPose;
  /** SIFT portrait 기준 얼굴 — 썸네일 정렬·확대 앵커 */
  faceCrop?: CharacterFaceCrop;
  iconCrop?: CharacterFaceCrop;
  footY?: number;
}

/** SIFT faceCrop 중심 Y. 없으면 iconCrop → baseline */
export function getFaceAnchorY(
  faceCrop?: CharacterFaceCrop,
  iconCrop?: CharacterFaceCrop,
): number {
  if (faceCrop) return faceCrop.top + faceCrop.height / 2;
  if (iconCrop) return iconCrop.top + iconCrop.height / 2;
  return THUMBNAIL_BASELINE_ICON_CENTER_Y;
}

export function getIconAnchorY(iconCrop?: CharacterFaceCrop): number {
  if (!iconCrop) return THUMBNAIL_BASELINE_ICON_CENTER_Y;
  return iconCrop.top + iconCrop.height / 2;
}

/** 머리 위 소품(총 등)으로 face Y가 위로 당겨진 경우 span 과대 보정 방지 */
export function getSpanAnchorY(metrics: ThumbnailSpriteMetrics): number | null {
  const { footY } = metrics;
  if (footY == null) return null;
  const faceY = getFaceAnchorY(metrics.faceCrop, metrics.iconCrop);
  return Math.max(faceY, THUMBNAIL_BASELINE_ICON_CENTER_Y);
}

export function getStandingSpan(metrics: ThumbnailSpriteMetrics): number | null {
  const spanAnchorY = getSpanAnchorY(metrics);
  if (spanAnchorY == null || metrics.footY == null) return null;
  const span = metrics.footY - spanAnchorY;
  return span > 0 ? span : null;
}

function getReferenceSpanPerCm(): number {
  const hikari = CHARACTER_CATALOG.hikari;
  const span = getStandingSpan({
    heightCm: hikari.heightCm,
    pose: hikari.pose ?? 'standing',
    faceCrop: hikari.faceCrop,
    iconCrop: hikari.iconCrop,
    footY: hikari.footY,
  });
  return span != null ? span / hikari.heightCm : 596 / 147;
}

/** heightCm만 반영한 기본 렌더 높이 */
export function getBaseCharHeightPx(
  heightCm: number,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const base = zoomMode ? THUMBNAIL_ZOOM_HEIGHT_PERCENT : THUMBNAIL_BASE_HEIGHT_PERCENT;
  return viewportHeightPx * (base / 100) * (heightCm / THUMBNAIL_REFERENCE_HEIGHT_CM);
}

/**
 * standing: span/heightCm으로 wiki leg art 비율 보정 (heightCm은 baseHeight에 유지)
 * seated: heightCm만 (나기사 등, span 미사용)
 */
export function getThumbnailCharHeightPx(
  metrics: ThumbnailSpriteMetrics,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const baseHeight = getBaseCharHeightPx(metrics.heightCm, zoomMode, viewportHeightPx);
  const pose = metrics.pose ?? 'standing';

  if (pose !== 'standing') {
    return baseHeight;
  }

  const span = getStandingSpan(metrics);
  if (span == null || metrics.heightCm <= 0) {
    return baseHeight;
  }

  const spanPerCm = span / metrics.heightCm;
  const refSpanPerCm = getReferenceSpanPerCm();
  return baseHeight * (refSpanPerCm / spanPerCm);
}

export function getThumbnailHeightScale(
  metrics: ThumbnailSpriteMetrics,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  return getThumbnailCharHeightPx(metrics, zoomMode, viewportHeightPx) / viewportHeightPx;
}

export function getThumbnailHeightPercent(
  metrics: ThumbnailSpriteMetrics,
  zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): string {
  const percent = getThumbnailHeightScale(metrics, zoomMode, viewportHeightPx) * 100;
  return `${percent}%`;
}

/** 147cm·bottom -180·히카리 faceCrop 기준 화면상 얼굴 중심 Y (확대와 무관) */
export function getThumbnailReferenceFaceY(
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const hikari = CHARACTER_CATALOG.hikari;
  const charHeight = getThumbnailCharHeightPx(
    {
      heightCm: hikari.heightCm,
      pose: hikari.pose ?? 'standing',
      faceCrop: hikari.faceCrop,
      iconCrop: hikari.iconCrop,
      footY: hikari.footY,
    },
    false,
    viewportHeightPx,
  );
  const scale = charHeight / THUMBNAIL_DEFAULT_SPRITE_HEIGHT;
  const spriteTop = viewportHeightPx - THUMBNAIL_BASE_BOTTOM_PX - charHeight;
  return spriteTop + getFaceAnchorY(hikari.faceCrop, hikari.iconCrop) * scale;
}

/** 화면상 얼굴 Y — 165cm 이하 동일, 그 이상만 천장 보정. 확대(zoom)와 무관. */
export function getThumbnailTargetFaceY(
  heightCm: number,
  _zoomMode = false,
  viewportHeightPx = THUMBNAIL_VIEWPORT_HEIGHT_PX,
): number {
  const referenceFaceY = getThumbnailReferenceFaceY(viewportHeightPx);

  if (heightCm <= THUMBNAIL_TALL_HEIGHT_CM) {
    return referenceFaceY;
  }

  const clampedHeight = Math.min(heightCm, THUMBNAIL_CEILING_HEIGHT_CM);
  const t =
    (clampedHeight - THUMBNAIL_TALL_HEIGHT_CM) /
    (THUMBNAIL_CEILING_HEIGHT_CM - THUMBNAIL_TALL_HEIGHT_CM);
  return referenceFaceY + t * (THUMBNAIL_MIN_FACE_Y_PX - referenceFaceY);
}

export interface ThumbnailBottomOffsetOptions extends ThumbnailSpriteMetrics {
  spriteHeight?: number;
  viewportHeightPx?: number;
}

/** faceCrop 중심 Y = targetFaceY. 확대는 얼굴 고정 기준으로 스케일만 증가. */
export function getThumbnailBottomOffsetPx(
  options: ThumbnailBottomOffsetOptions,
  zoomMode = false,
): number {
  const viewportHeightPx = options.viewportHeightPx ?? THUMBNAIL_VIEWPORT_HEIGHT_PX;
  const spriteHeight = options.spriteHeight ?? THUMBNAIL_DEFAULT_SPRITE_HEIGHT;
  const faceAnchorY = getFaceAnchorY(options.faceCrop, options.iconCrop);
  const charHeight = getThumbnailCharHeightPx(options, zoomMode, viewportHeightPx);
  const scale = charHeight / spriteHeight;
  const targetFaceY = getThumbnailTargetFaceY(options.heightCm, zoomMode, viewportHeightPx);

  return viewportHeightPx - charHeight + faceAnchorY * scale - targetFaceY;
}
