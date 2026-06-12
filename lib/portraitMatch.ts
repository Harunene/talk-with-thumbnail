import path from 'node:path';
import type { CharacterId } from './characterCatalog';

/** Wiki Portrait와 표정이 일치하는 기준 스프라이트 (기본 001) */
export const PORTRAIT_REFERENCE_EXPRESSION: Partial<Record<CharacterId, string>> = {
  // aris: 표정 검토용으로 001 사용 (Portrait는 통상 002와 페어)
};

export function referenceExpressionId(characterId: CharacterId): string {
  return PORTRAIT_REFERENCE_EXPRESSION[characterId] ?? '001';
}

export function referenceSpriteFile(characterId: CharacterId, files: string[]): string {
  const expr = referenceExpressionId(characterId);
  return (
    files.find((file) => file.includes(`_${expr}.`)) ??
    files.find((file) => file.includes('_001.')) ??
    files[0]
  );
}

export function referenceSpritePath(
  characterId: CharacterId,
  charDir: string,
  files: string[],
): string {
  return path.join(charDir, referenceSpriteFile(characterId, files));
}
