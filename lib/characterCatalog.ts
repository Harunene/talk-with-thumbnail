export type SchoolId = 'millennium' | 'trinity' | 'abydos';

export type ClubId =
  | 'game-development'
  | 'seminar'
  | 'tea-party'
  | 'ccc'
  | 'freight-rail'
  | 'super-phenomenon-task-force';

export interface CharacterVariantDef {
  id: string;
  label: string;
  /** Wiki Special:FilePath prefix (기본형과 다를 때) */
  wikiPrefix?: string;
  isDefault?: boolean;
}

export interface CharacterFaceCrop {
  left: number;
  top: number;
  width: number;
  height: number;
  /** 얼굴 대신 썸네일 중앙 기준 X (넓은 스프라이트용) */
  anchorX?: number;
}

export interface CharacterCatalogEntry {
  id: string;
  name: string;
  /** 말풍선 하단 소속 표시 */
  affiliation: string;
  school: SchoolId;
  schoolLabel: string;
  club?: ClubId;
  clubLabel?: string;
  variants: CharacterVariantDef[];
  defaultVariantId: string;
  maxExpressions: number;
  defaultExpression: string;
  defaultBackgroundId: string;
  wikiPrefix: string;
  /** 프로필 키(cm). 썸네일 표시 배율 기준 */
  heightCm: number;
  /** Wiki 갤러리 0-based 인덱스. 생략 시 0..maxExpressions-1 */
  wikiSpriteIndices?: number[];
  /** char_small_centered 기준 얼굴 크롭 (SIFT portrait) */
  faceCrop?: CharacterFaceCrop;
  /** char_small_centered 기준 표정 icon crop (SIFT+fuyucc, 001 ref) */
  iconCrop?: CharacterFaceCrop;
  /** char_small_centered 001 ref — opaque alpha 최하단 Y (발) */
  footY?: number;
  /** standing: face→발 span 정규화. seated: heightCm만 */
  pose?: 'standing' | 'seated';
  /** char_small_centered 스프라이트 기준 너비 (높이 768px) */
  spriteReferenceWidth?: number;
  thumbnailOffsetXPercent?: number;
  thumbnailBottomOffset?: number;
}

const defaultVariant = (wikiPrefix: string): CharacterVariantDef[] => [
  { id: 'default', label: '기본', wikiPrefix, isDefault: true },
];

export const CHARACTER_CATALOG = {
  hikari: {
    id: 'hikari',
    name: '히카리',
    affiliation: 'CCC',
    school: 'abydos',
    schoolLabel: '아비도스',
    club: 'ccc',
    clubLabel: 'CCC',
    variants: defaultVariant('Hikari'),
    defaultVariantId: 'default',
    maxExpressions: 18,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    wikiPrefix: 'Hikari',
    heightCm: 147,
    pose: 'standing',
    footY: 763,
    faceCrop: { left: 127, top: 47, width: 201, height: 201 },
    iconCrop: { left: 194, top: 117, width: 96, height: 96 },
    spriteReferenceWidth: 455,
  },
  nozomi: {
    id: 'nozomi',
    name: '노조미',
    affiliation: 'CCC',
    school: 'abydos',
    schoolLabel: '아비도스',
    club: 'ccc',
    clubLabel: 'CCC',
    variants: defaultVariant('Nozomi'),
    defaultVariantId: 'default',
    maxExpressions: 21,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    wikiPrefix: 'Nozomi',
    heightCm: 147,
    pose: 'standing',
    footY: 761,
    faceCrop: { left: 160, top: 72, width: 157, height: 157 },
    iconCrop: { left: 183, top: 135, width: 79, height: 79 },
    spriteReferenceWidth: 477,
  },
  aoba: {
    id: 'aoba',
    name: '아오바',
    affiliation: '화물운송관리부',
    school: 'abydos',
    schoolLabel: '아비도스',
    club: 'freight-rail',
    clubLabel: '화물철도 관리부',
    variants: defaultVariant('Aoba'),
    defaultVariantId: 'default',
    maxExpressions: 29,
    defaultExpression: '001',
    defaultBackgroundId: 'abydos-desert',
    wikiPrefix: 'Aoba',
    heightCm: 151,
    pose: 'standing',
    footY: 764,
    faceCrop: { left: 119, top: 46, width: 179, height: 179 },
    iconCrop: { left: 152, top: 110, width: 88, height: 88 },
    spriteReferenceWidth: 417,
  },
  aris: {
    id: 'aris',
    name: '아리스',
    affiliation: '게임개발부',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'game-development',
    clubLabel: '게임개발부',
    variants: defaultVariant('Aris'),
    defaultVariantId: 'default',
    maxExpressions: 14,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev-room',
    wikiPrefix: 'Aris',
    heightCm: 152,
    pose: 'standing',
    footY: 767,
    faceCrop: { left: 259, top: 33, width: 172, height: 172 },
    iconCrop: { left: 293, top: 90, width: 92, height: 92 },
    spriteReferenceWidth: 690,
  },
  momoi: {
    id: 'momoi',
    name: '모모이',
    affiliation: '게임개발부',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'game-development',
    clubLabel: '게임개발부',
    variants: [
      { id: 'default', label: '기본', wikiPrefix: 'Momoi', isDefault: true },
      { id: 'maid', label: '메이드', wikiPrefix: 'Momoi (Maid)' },
    ],
    defaultVariantId: 'default',
    maxExpressions: 9,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev-room',
    wikiPrefix: 'Momoi',
    heightCm: 143,
    pose: 'standing',
    footY: 766,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    faceCrop: { left: 349, top: 44, width: 195, height: 195 },
    iconCrop: { left: 389, top: 104, width: 95, height: 95 },
    spriteReferenceWidth: 893,
  },
  midori: {
    id: 'midori',
    name: '미도리',
    affiliation: '게임개발부',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'game-development',
    clubLabel: '게임개발부',
    variants: [
      { id: 'default', label: '기본', wikiPrefix: 'Midori', isDefault: true },
      { id: 'maid', label: '메이드', wikiPrefix: 'Midori (Maid)' },
    ],
    defaultVariantId: 'default',
    maxExpressions: 11,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev-room',
    wikiPrefix: 'Midori',
    heightCm: 143,
    pose: 'standing',
    footY: 766,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    faceCrop: { left: 294, top: 64, width: 176, height: 176 },
    iconCrop: { left: 365, top: 127, width: 81, height: 81 },
    spriteReferenceWidth: 764,
  },
  yuzu: {
    id: 'yuzu',
    name: '유즈',
    affiliation: '게임개발부',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'game-development',
    clubLabel: '게임개발부',
    variants: defaultVariant('Yuzu'),
    defaultVariantId: 'default',
    maxExpressions: 9,
    defaultExpression: '001',
    defaultBackgroundId: 'gamedev-room',
    wikiPrefix: 'Yuzu',
    heightCm: 150,
    pose: 'standing',
    footY: 767,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    faceCrop: { left: 159, top: 53, width: 178, height: 178 },
    iconCrop: { left: 192, top: 90, width: 103, height: 103 },
    spriteReferenceWidth: 496,
  },
  kei: {
    id: 'kei',
    name: '케이',
    affiliation: '초현상특무부',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'super-phenomenon-task-force',
    clubLabel: '초현상특무부',
    variants: defaultVariant('Kei'),
    defaultVariantId: 'default',
    maxExpressions: 30,
    defaultExpression: '001',
    defaultBackgroundId: 'eridu-tower-inside',
    wikiPrefix: 'Kei',
    heightCm: 152,
    pose: 'standing',
    footY: 765,
    faceCrop: { left: 521, top: 59, width: 147, height: 147 },
    iconCrop: { left: 542, top: 98, width: 97, height: 97 },
    spriteReferenceWidth: 1189,
  },
  yuuka: {
    id: 'yuuka',
    name: '유우카',
    affiliation: '세미나',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'seminar',
    clubLabel: '세미나',
    variants: defaultVariant('Yuuka'),
    defaultVariantId: 'default',
    maxExpressions: 8,
    defaultExpression: '001',
    defaultBackgroundId: 'computer-center',
    wikiPrefix: 'Yuuka',
    heightCm: 156,
    pose: 'standing',
    footY: 767,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    faceCrop: { left: 79, top: 23, width: 179, height: 179 },
    iconCrop: { left: 119, top: 71, width: 89, height: 89 },
    spriteReferenceWidth: 337,
  },
  noa: {
    id: 'noa',
    name: '노아',
    affiliation: '세미나',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'seminar',
    clubLabel: '세미나',
    variants: defaultVariant('Noa'),
    defaultVariantId: 'default',
    maxExpressions: 8,
    defaultExpression: '001',
    defaultBackgroundId: 'computer-center',
    wikiPrefix: 'Noa',
    heightCm: 161,
    pose: 'standing',
    footY: 767,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    faceCrop: { left: 207, top: 32, width: 141, height: 141 },
    iconCrop: { left: 242, top: 73, width: 81, height: 81 },
    spriteReferenceWidth: 555,
  },
  koyuki: {
    id: 'koyuki',
    name: '코유키',
    affiliation: '세미나',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'seminar',
    clubLabel: '세미나',
    variants: defaultVariant('Koyuki'),
    defaultVariantId: 'default',
    maxExpressions: 16,
    defaultExpression: '001',
    defaultBackgroundId: 'computer-center',
    wikiPrefix: 'Koyuki',
    heightCm: 149,
    pose: 'standing',
    footY: 767,
    wikiSpriteIndices: Array.from({ length: 16 }, (_, i) => i),
    faceCrop: { left: 291, top: 19, width: 182, height: 182 },
    iconCrop: { left: 349, top: 84, width: 83, height: 83 },
    spriteReferenceWidth: 764,
  },
  rio: {
    id: 'rio',
    name: '리오',
    affiliation: '세미나',
    school: 'millennium',
    schoolLabel: '밀레니엄',
    club: 'seminar',
    clubLabel: '세미나',
    variants: defaultVariant('Rio'),
    defaultVariantId: 'default',
    maxExpressions: 10,
    defaultExpression: '001',
    defaultBackgroundId: 'eridu-tower-entrance',
    wikiPrefix: 'Rio',
    heightCm: 171,
    pose: 'standing',
    footY: 766,
    wikiSpriteIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    faceCrop: { left: 141, top: 37, width: 120, height: 120 },
    iconCrop: { left: 168, top: 70, width: 74, height: 74 },
    spriteReferenceWidth: 402,
  },
  nagisa: {
    id: 'nagisa',
    name: '나기사',
    affiliation: '티파티',
    school: 'trinity',
    schoolLabel: '트리니티',
    club: 'tea-party',
    clubLabel: '티파티',
    variants: defaultVariant('Nagisa'),
    defaultVariantId: 'default',
    maxExpressions: 17,
    defaultExpression: '001',
    defaultBackgroundId: 'trinity-terrace',
    wikiPrefix: 'Nagisa',
    heightCm: 160,
    pose: 'seated',
    footY: 766,
    wikiSpriteIndices: Array.from({ length: 17 }, (_, i) => i),
    faceCrop: { left: 241, top: 70, width: 155, height: 155 },
    iconCrop: { left: 261, top: 131, width: 69, height: 69 },
    spriteReferenceWidth: 637,
  },
  mika: {
    id: 'mika',
    name: '미카',
    affiliation: '티파티',
    school: 'trinity',
    schoolLabel: '트리니티',
    club: 'tea-party',
    clubLabel: '티파티',
    variants: defaultVariant('Mika'),
    defaultVariantId: 'default',
    maxExpressions: 30,
    defaultExpression: '001',
    defaultBackgroundId: 'trinity-terrace',
    wikiPrefix: 'Mika',
    heightCm: 157,
    pose: 'standing',
    footY: 767,
    wikiSpriteIndices: Array.from({ length: 30 }, (_, i) => i),
    faceCrop: { left: 178, top: 88, width: 143, height: 143 },
    iconCrop: { left: 232, top: 126, width: 78, height: 78 },
    spriteReferenceWidth: 499,
  },
  seia: {
    id: 'seia',
    name: '세이아',
    affiliation: '티파티',
    school: 'trinity',
    schoolLabel: '트리니티',
    club: 'tea-party',
    clubLabel: '티파티',
    variants: defaultVariant('Seia'),
    defaultVariantId: 'default',
    maxExpressions: 10,
    defaultExpression: '001',
    defaultBackgroundId: 'trinity-terrace',
    wikiPrefix: 'Seia',
    heightCm: 149,
    pose: 'standing',
    footY: 766,
    wikiSpriteIndices: Array.from({ length: 10 }, (_, i) => i),
    faceCrop: { left: 169, top: 43, width: 191, height: 191 },
    iconCrop: { left: 212, top: 96, width: 99, height: 99 },
    spriteReferenceWidth: 529,
  },
} as const satisfies Record<string, CharacterCatalogEntry>;

export type CharacterId = keyof typeof CHARACTER_CATALOG;

export const CHARACTER_IDS = [
  'hikari',
  'nozomi',
  'aoba',
  'aris',
  'momoi',
  'midori',
  'yuzu',
  'kei',
  'yuuka',
  'noa',
  'koyuki',
  'rio',
  'nagisa',
  'mika',
  'seia',
] as const satisfies readonly CharacterId[];

export function getWikiSpriteIndices(entry: CharacterCatalogEntry): number[] {
  if (entry.wikiSpriteIndices) return [...entry.wikiSpriteIndices];
  return Array.from({ length: entry.maxExpressions }, (_, i) => i);
}

export function getDefaultVariant(entry: CharacterCatalogEntry): CharacterVariantDef {
  return (
    entry.variants.find((variant) => variant.id === entry.defaultVariantId) ??
    entry.variants.find((variant) => variant.isDefault) ??
    entry.variants[0]
  );
}

export function resolveVariantWikiPrefix(
  entry: CharacterCatalogEntry,
  variantId?: string,
): string {
  const variant = variantId
    ? entry.variants.find((item) => item.id === variantId)
    : getDefaultVariant(entry);
  return variant?.wikiPrefix ?? entry.wikiPrefix;
}
