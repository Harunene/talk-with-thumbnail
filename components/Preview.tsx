import BlueArchivePreview from './BlueArchivePreview';
import PlainPreview from './PlainPreview';

export interface PreviewProps {
  message: string;
  imageBaseUrl?: string;
  imageType?: ImageType;
}

export type ImageType = 'sana_stare' | 'sana_dizzy' | 'cat_lick' | 'cat_scared' | 'ichihime' | 'sans' | 'hikari' | 'nozomi';

// 기본 Preview 컴포넌트 - 이미지 타입에 따라 적절한 컴포넌트를 렌더링
export default function Preview({ message, imageBaseUrl = '', imageType = 'sana_stare' }: PreviewProps) {
  // BlueArchive 캐릭터인지 확인
  const isBlueArchive = imageType === 'hikari' || imageType === 'nozomi';
  
  // 이미지 타입에 따라 다른 컴포넌트 렌더링
  if (isBlueArchive) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <BlueArchivePreview message={message} imageBaseUrl={imageBaseUrl} imageType={imageType} />
      </div>
    );
  } else {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <PlainPreview message={message} imageBaseUrl={imageBaseUrl} imageType={imageType} />
      </div>
    );
  }
}

