import { resolveBackgroundId } from '@/lib/backgrounds';
import type { MessageData } from '@/lib/blob';
import {
  CHARACTER_IDS,
  CHARACTERS,
  isCharacterId,
  type CharacterId,
} from '@/lib/characters';

export interface EditorInitialState {
  userMessage: string;
  currentId: string;
  imageType: CharacterId;
  subType: string;
  backgroundId: string;
  lastSubTypes: Record<CharacterId, string>;
  lastBackgroundIds: Record<CharacterId, string>;
  zoomMode: boolean;
}

function createLastSelectionMaps() {
  return {
    lastSubTypes: Object.fromEntries(
      CHARACTER_IDS.map((id) => [id, CHARACTERS[id].defaultExpression]),
    ) as Record<CharacterId, string>,
    lastBackgroundIds: Object.fromEntries(
      CHARACTER_IDS.map((id) => [id, CHARACTERS[id].defaultBackgroundId]),
    ) as Record<CharacterId, string>,
  };
}

export function createEditorInitialState(
  messageId = '',
  initialData?: MessageData | null,
): EditorInitialState {
  const { lastSubTypes, lastBackgroundIds } = createLastSelectionMaps();
  const imageType: CharacterId =
    initialData?.imageType && isCharacterId(initialData.imageType)
      ? initialData.imageType
      : 'hikari';
  const subType = initialData?.subType || CHARACTERS[imageType].defaultExpression;
  const backgroundId = resolveBackgroundId(
    initialData?.backgroundId,
    CHARACTERS[imageType].defaultBackgroundId,
  );

  lastSubTypes[imageType] = subType;
  lastBackgroundIds[imageType] = backgroundId;

  return {
    userMessage: initialData?.message ?? '',
    currentId: messageId,
    imageType,
    subType,
    backgroundId,
    lastSubTypes,
    lastBackgroundIds,
    zoomMode: initialData?.zoomMode ?? false,
  };
}
