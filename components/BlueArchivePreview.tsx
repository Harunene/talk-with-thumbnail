import { CHARACTERS, type CharacterId } from '@/lib/characters';
import { getBackgroundPath, resolveBackgroundId } from '@/lib/backgrounds';
import type { PreviewProps } from './Preview';

function BlueArchivePreview({
  message,
  imageBaseUrl = '',
  imageType = 'hikari',
  subType = '001',
  zoomMode = false,
  backgroundId,
}: PreviewProps) {
  const config = CHARACTERS[imageType as CharacterId] ?? CHARACTERS.hikari;

  const validSubType =
    subType &&
    /^\d{3}$/.test(subType) &&
    Number(subType) > 0 &&
    Number(subType) <= config.maxExpressions
      ? subType
      : config.defaultExpression;

  const resolvedBackgroundId = resolveBackgroundId(backgroundId, config.defaultBackgroundId);
  const bgImagePath = `${imageBaseUrl}${getBackgroundPath(resolvedBackgroundId)}`;
  const charImagePath = `${imageBaseUrl}/images/bluearchive/char_small/${imageType}/up_${imageType}_${validSubType}.png`;

  const darkNavyBlue = '#1A2B5F';
  const textPadding = '60px';
  const dialogBackgroundColor = (opacity: number) => `rgba(12, 17, 29, ${opacity})`;
  const charImageHeight = zoomMode ? '200%' : '150%';
  const charImageBottom = zoomMode ? '-320px' : '-180px';
  const messageFontSize = zoomMode ? '20px' : '14px';

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'Gyeonggi Medium',
        overflow: 'hidden',
      }}
    >
      <img
        src={bgImagePath}
        alt="배경"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      <img
        src={charImagePath}
        alt={config.name}
        style={{
          position: 'absolute',
          bottom: charImageBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          height: charImageHeight,
          objectFit: 'contain',
          display: 'block',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '20px',
          display: 'flex',
          gap: '4px',
        }}
      >
        {['AUTO', 'MENU'].map((label) => (
          <div
            key={label}
            style={{
              display: 'flex',
              backgroundColor: 'white',
              color: 'rgb(15, 45, 72)',
              padding: '6px 10px 3px 10px',
              borderRadius: '2px',
              fontWeight: 'semibold',
              fontSize: '12px',
              boxShadow: '1px 2px 2px rgba(0,0,0,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              transform: 'skew(-10deg)',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          height: '130px',
          background: `linear-gradient(to bottom, ${dialogBackgroundColor(0)} 0%, ${dialogBackgroundColor(0.5)} 15%, ${dialogBackgroundColor(0.78)} 30%, ${dialogBackgroundColor(0.78)} 100%)`,
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: textPadding,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: 'bold',
            lineHeight: '1',
            textShadow: `-1px -1px 0 ${darkNavyBlue}, 1px -1px 0 ${darkNavyBlue}, -1px 1px 0 ${darkNavyBlue}, 1px 1px 0 ${darkNavyBlue}`,
          }}
        >
          {config.name}
        </span>
        <span
          style={{
            color: 'rgb(157, 202, 241)',
            fontSize: '13px',
            fontWeight: 'bold',
            lineHeight: '1',
            paddingBottom: '1px',
            textShadow: `-1px -1px 0 ${darkNavyBlue}, 1px -1px 0 ${darkNavyBlue}, -1px 1px 0 ${darkNavyBlue}, 1px 1px 0 ${darkNavyBlue}`,
          }}
        >
          {config.affiliation}
        </span>
      </div>

      <hr
        style={{
          position: 'absolute',
          top: '76%',
          left: textPadding,
          right: textPadding,
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          margin: 0,
          padding: 0,
          display: 'block',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '78%',
          height: 'auto',
          left: textPadding,
          right: textPadding,
          color: 'white',
          fontSize: messageFontSize,
          lineHeight: 1.4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textShadow: `0 0 5px ${darkNavyBlue}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'block',
            width: '100%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          }}
        >
          {message}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: textPadding,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg width="10" height="7" viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0,0 L20,0 L10,15 Z" fill="rgb(57, 209, 255)" />
        </svg>
      </div>
    </div>
  );
}

export default BlueArchivePreview;
