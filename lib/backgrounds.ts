export interface BackgroundConfig {
  id: string;
  name: string;
  file: string;
}

export const BACKGROUNDS: BackgroundConfig[] = [
  { id: 'abydos-desert', name: '아비도스 사막', file: 'abydos-desert.jpg' },
  { id: 'abydos-ruin-area', name: '아비도스 유적', file: 'abydos-ruin-area.jpg' },
  { id: 'gamedev', name: '게임개발부', file: 'gamedev.jpg' },
  { id: 'arona-room', name: '아로나 룸', file: 'arona-room.jpg' },
  { id: 'committee-room', name: '대책위원회', file: 'committee-room.jpg' },
  { id: 'computer-center', name: '전산실', file: 'computer-center.jpg' },
  { id: 'campus', name: '캠퍼스', file: 'campus.jpg' },
  { id: 'classroom', name: '교실', file: 'classroom.jpg' },
  { id: 'beachside', name: '해변', file: 'beachside.jpg' },
  { id: 'city-downtown', name: '시내', file: 'city-downtown.jpg' },
];

export const BACKGROUND_MAP = Object.fromEntries(
  BACKGROUNDS.map((bg) => [bg.id, bg])
) as Record<string, BackgroundConfig>;

export function isBackgroundId(value: string): value is string {
  return value in BACKGROUND_MAP;
}

export function getBackgroundPath(backgroundId: string): string {
  const bg = BACKGROUND_MAP[backgroundId];
  if (!bg) return `/images/bluearchive/bg/${BACKGROUNDS[0].file}`;
  return `/images/bluearchive/bg/${bg.file}`;
}

export function resolveBackgroundId(backgroundId?: string, fallbackId?: string): string {
  if (backgroundId && isBackgroundId(backgroundId)) return backgroundId;
  if (fallbackId && isBackgroundId(fallbackId)) return fallbackId;
  return BACKGROUNDS[0].id;
}
