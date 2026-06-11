export type CharacterId = 'hikari' | 'nozomi' | 'aris';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  affiliation: string;
  maxExpressions: number;
  defaultExpression: string;
  defaultBackgroundId: string;
}

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  hikari: {
    id: 'hikari',
    name: '히카리',
    affiliation: 'CCC',
    maxExpressions: 18,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
  },
  nozomi: {
    id: 'nozomi',
    name: '노조미',
    affiliation: 'CCC',
    maxExpressions: 21,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
  },
  aris: {
    id: 'aris',
    name: '아리스',
    affiliation: '게임개발부',
    maxExpressions: 14,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev',
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];

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
