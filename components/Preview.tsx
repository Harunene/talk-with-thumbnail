import BlueArchivePreview from './BlueArchivePreview';
import type { CharacterId } from '@/lib/characters';

export interface PreviewProps {
  message: string;
  imageBaseUrl?: string;
  imageType?: CharacterId;
  subType?: string;
  zoomMode?: boolean;
  backgroundId?: string;
}

export type ImageType = CharacterId;

export default function Preview({
  message,
  imageBaseUrl = '',
  imageType = 'hikari',
  subType = '',
  zoomMode = false,
  backgroundId,
}: PreviewProps) {
  return (
    <BlueArchivePreview
      message={message}
      imageBaseUrl={imageBaseUrl}
      imageType={imageType}
      subType={subType}
      zoomMode={zoomMode}
      backgroundId={backgroundId}
    />
  );
}
