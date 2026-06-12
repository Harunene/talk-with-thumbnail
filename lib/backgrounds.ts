export interface BackgroundConfig {
  id: string;
  name: string;
  file: string;
  /** Wiki Special:FilePath 파일명 */
  wikiFile?: string;
}

export const BACKGROUNDS: BackgroundConfig[] = [
  { id: 'abydos-desert', name: '아비도스 사막', file: 'abydos-desert.jpg' },
  { id: 'abydos-ruin-area', name: '아비도스 유적', file: 'abydos-ruin-area.jpg' },
  { id: 'gamedev', name: '게임개발부', file: 'gamedev.jpg' },
  { id: 'gamedev-room', name: '게임개발부 부실', file: 'gamedev-room.jpg', wikiFile: 'BG GameDevRoom.jpg' },
  { id: 'arona-room', name: '아로나 룸', file: 'arona-room.jpg' },
  { id: 'committee-room', name: '대책위원회', file: 'committee-room.jpg' },
  { id: 'computer-center', name: '전산실', file: 'computer-center.jpg' },
  {
    id: 'computer-center-erode',
    name: '전산실(침식)',
    file: 'computer-center-erode.jpg',
    wikiFile: 'BG ComputerCenter Erode.jpg',
  },
  { id: 'campus', name: '캠퍼스', file: 'campus.jpg' },
  { id: 'classroom', name: '교실', file: 'classroom.jpg' },
  { id: 'beachside', name: '해변', file: 'beachside.jpg' },
  { id: 'city-downtown', name: '시내', file: 'city-downtown.jpg' },
  {
    id: 'eridu-tower-entrance',
    name: '에리두 탑 입구',
    file: 'eridu-tower-entrance.jpg',
    wikiFile: 'BG EriduTowerEntrance.jpg',
  },
  {
    id: 'eridu-tower-inside',
    name: '에리두 탑 내부',
    file: 'eridu-tower-inside.jpg',
    wikiFile: 'BG EriduTowerInside.jpg',
  },
  {
    id: 'eridu-tower-rooftop',
    name: '에리두 탑 옥상',
    file: 'eridu-tower-rooftop.jpg',
    wikiFile: 'BG EriduTowerRooftop.jpg',
  },
  { id: 'cathedral', name: '대성당', file: 'cathedral.jpg', wikiFile: 'BG Cathedral.jpg' },
  {
    id: 'trinity-terrace',
    name: '트리니티 테라스',
    file: 'trinity-terrace.jpg',
    wikiFile: 'BG_TrinityTerrace.jpg',
  },
  {
    id: 'trinity-classroom',
    name: '트리니티 교실',
    file: 'trinity-classroom.jpg',
    wikiFile: 'BG_TrinityClassRoom.jpg',
  },
  {
    id: 'trinity-club-room',
    name: '트리니티 동아리실',
    file: 'trinity-club-room.jpg',
    wikiFile: 'BG_TrinityClubRoom.jpg',
  },
];

export const BACKGROUND_MAP = Object.fromEntries(
  BACKGROUNDS.map((bg) => [bg.id, bg]),
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

export const BACKGROUNDS_WITH_WIKI = BACKGROUNDS.filter((bg) => bg.wikiFile);
