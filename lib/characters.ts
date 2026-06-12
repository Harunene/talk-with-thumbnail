import {
  CHARACTER_CATALOG,
  CHARACTER_IDS,
  getDefaultVariant,
  type CharacterCatalogEntry,
  type CharacterFaceCrop,
  type CharacterId,
  type CharacterVariantDef,
  type ClubId,
  type SchoolId,
} from '@/lib/characterCatalog';

export type {
  CharacterCatalogEntry,
  CharacterFaceCrop,
  CharacterId,
  CharacterVariantDef,
  ClubId,
  SchoolId,
};

export { CHARACTER_IDS };

export type CharacterConfig = CharacterCatalogEntry;

export const CHARACTERS: Record<CharacterId, CharacterCatalogEntry> = CHARACTER_CATALOG;

export function isCharacterId(value: string): value is CharacterId {
  return value in CHARACTERS;
}

export function resolveCharacterVariantId(
  characterId: CharacterId,
  variantId?: string,
): string {
  const entry = CHARACTERS[characterId];
  if (!variantId || variantId === entry.defaultVariantId) {
    return entry.defaultVariantId;
  }
  return entry.variants.some((variant) => variant.id === variantId)
    ? variantId
    : entry.defaultVariantId;
}

/** char_small / char_face 디렉터리명. 기본형은 캐릭터 id, 스킨은 `{id}--{variant}` */
export function getCharacterAssetFolder(
  characterId: CharacterId,
  variantId?: string,
): string {
  const resolved = resolveCharacterVariantId(characterId, variantId);
  if (resolved === 'default') return characterId;
  return `${characterId}--${resolved}`;
}

export function formatExpression(index: number): string {
  return index.toString().padStart(3, '0');
}

export function getExpressionNumbers(characterId: CharacterId): number[] {
  const { maxExpressions } = CHARACTERS[characterId];
  return Array.from({ length: maxExpressions }, (_, i) => i + 1);
}

export function getCharacterFacePath(
  characterId: CharacterId,
  expression: string,
  variantId?: string,
): string {
  const folder = getCharacterAssetFolder(characterId, variantId);
  return `/images/bluearchive/char_face/${folder}/up_${characterId}_${expression}.png`;
}

export function getCharacterSpritePath(
  characterId: CharacterId,
  expression: string,
  variantId?: string,
  options?: { centered?: boolean },
): string {
  const folder = getCharacterAssetFolder(characterId, variantId);
  const spriteRoot = options?.centered ? 'char_small_centered' : 'char_small';
  return `/images/bluearchive/${spriteRoot}/${folder}/up_${characterId}_${expression}.png`;
}

export function getDefaultVariantFor(characterId: CharacterId): CharacterVariantDef {
  return getDefaultVariant(CHARACTERS[characterId]);
}
