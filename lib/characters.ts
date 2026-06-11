export type CharacterId = 'hikari' | 'nozomi' | 'aoba' | 'aris' | 'kei' | 'momoi';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  affiliation: string;
  maxExpressions: number;
  defaultExpression: string;
  defaultBackgroundId: string;
  /** 얼굴 크롭 (center_sprites.js 적용 후 char_small 기준) */
  faceCrop?: { left: number; top: number; width: number; height: number };
  /** char_small 스프라이트 기준 너비 (높이 768px) */
  spriteReferenceWidth: number;
  /** 썸네일 수평 보정: left 50% 기준 추가 % (1 ≈ 6px) */
  thumbnailOffsetXPercent?: number;
  /** 썸네일 수직 보정: bottom에 더할 px (양수 = 위로) */
  thumbnailBottomOffset?: number;
}

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  hikari: {
    id: 'hikari',
    name: '히카리',
    affiliation: 'CCC',
    maxExpressions: 18,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    faceCrop: { left: 171, top: 103, width: 100, height: 100 },
    spriteReferenceWidth: 442,
  },
  nozomi: {
    id: 'nozomi',
    name: '노조미',
    affiliation: 'CCC',
    maxExpressions: 21,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    faceCrop: { left: 171, top: 108, width: 100, height: 100 },
    spriteReferenceWidth: 442,
  },
  aoba: {
    id: 'aoba',
    name: '아오바',
    affiliation: '화물철도 관리부',
    maxExpressions: 29,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    faceCrop: { left: 146, top: 88, width: 100, height: 100 },
    spriteReferenceWidth: 392,
  },
  aris: {
    id: 'aris',
    name: '아리스',
    affiliation: '게임개발부',
    maxExpressions: 14,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev',
    faceCrop: { left: 292, top: 80, width: 100, height: 100 },
    spriteReferenceWidth: 684,
  },
  kei: {
    id: 'kei',
    name: '케이',
    affiliation: '초현상특무부',
    maxExpressions: 30,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev',
    faceCrop: { left: 543, top: 86, width: 100, height: 100 },
    spriteReferenceWidth: 1156,
    thumbnailOffsetXPercent: -1,
    thumbnailBottomOffset: 8,
  },
  momoi: {
    id: 'momoi',
    name: '모모이',
    affiliation: '게임개발부',
    maxExpressions: 9,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev',
    faceCrop: { left: 392, top: 90, width: 100, height: 100 },
    spriteReferenceWidth: 884,
  },
};

/** 철도(히카리·노조미·아오바) → 게임개발부(아리스·케이·모모이) 순서 */
export const CHARACTER_IDS: CharacterId[] = [
  'hikari',
  'nozomi',
  'aoba',
  'aris',
  'kei',
  'momoi',
];

export function isCharacterId(value: string): value is CharacterId {
  return value in CHARACTERS;
}

export function formatExpression(index: number): string {
  return index.toString().padStart(3, '0');
}

export function getExpressionNumbers(characterId: CharacterId): number[] {
  const { maxExpressions } = CHARACTERS[characterId];
  return Array.from({ length: maxExpressions }, (_, i) => i + 1);
}

export function getCharacterFacePath(characterId: CharacterId, expression: string): string {
  return `/images/bluearchive/char_face/${characterId}/up_${characterId}_${expression}.png`;
}

export function getCharacterSpritePath(characterId: CharacterId, expression: string): string {
  return `/images/bluearchive/char_small/${characterId}/up_${characterId}_${expression}.png`;
}
