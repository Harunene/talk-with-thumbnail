import type { ImageType, PreviewProps } from './Preview';
import React from 'react';
import { EmptyLine } from '@/lib/EmptyLine';

// 블루 아카이브 스타일의 말풍선 컴포넌트
function BlueArchivePreview({ message, imageBaseUrl = '', imageType = 'hikari', subType = '001' }: PreviewProps) {
  
  // 캐릭터별 설정
  const characterConfig = {
    hikari: {
      name: '히카리',
      nameColor: '#FFFFFF', // 흰색으로 변경
      textColor: '#FFFFFF',
      maxSubTypes: 18, // 히카리의 최대 이미지 인덱스
    },
    nozomi: {
      name: '노조미',
      nameColor: '#FFFFFF', // 흰색으로 변경
      textColor: '#FFFFFF',
      maxSubTypes: 21, // 노조미의 최대 이미지 인덱스
    }
  };
  
  const config = characterConfig[imageType as 'hikari' | 'nozomi'];
  
  // subType 유효성 검사 (비어있거나 범위를 벗어나면 001로 설정)
  const validSubType = (subType && /^\d{3}$/.test(subType) && Number(subType) > 0 && Number(subType) <= config.maxSubTypes) 
    ? subType 
    : '001';
  
  // 이미지 경로 설정 (작은 이미지 사용)
  const bgImagePath = `${imageBaseUrl}/images/bluearchive/bg.jpg`;
  const charImagePath = `${imageBaseUrl}/images/bluearchive/char_small/${imageType}/up_${imageType}_${validSubType}.png`;

  // 어두운 군청색 (아웃라인 및 글로우 효과용)
  const darkNavyBlue = '#1A2B5F';
  
  const textPadding = '60px';

  const dialogBackgroundColor = (opacity: number) => `rgba(12, 17, 29, ${opacity})`;


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
      {/* 배경 이미지 */}
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

      {/* 캐릭터 이미지 - 상반신만 보이도록 확대 및 위치 조정 */}
      <img
        src={charImagePath}
        alt={config.name}
        style={{
          position: 'absolute',
          bottom: '-180px', // 상반신만 보이도록 위치 조정
          left: '50%',
          transform: 'translateX(-50%)',
          height: '150%', // 확대하여 상반신만 보이게 함
          objectFit: 'contain',
          display: 'block',
        }}
      />
      
      {/* 상단 UI 요소 - AUTO, MENU 버튼 (skew 변형 추가) */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '20px',
          display: 'flex',
          gap: '4px',
        }}
      >
        <div
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
            transform: 'skew(-10deg)', // skew 변형 추가
          }}
        >
          AUTO
        </div>
        <div
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
            transform: 'skew(-10deg)', // skew 변형 추가
          }}
        >
          MENU
        </div>
      </div>
      
      {/* 대화창 배경 - 그라데이션 추가 */}
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
      
      {/* 캐릭터 이름 영역 - 아웃라인 추가 */}
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
            color: config.nameColor,
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
          CCC
        </span>
      </div>
      
      {/* 이름과 대사 사이의 구분선 - 다른 접근법 시도 */}
      <hr
        style={{
          position: 'absolute',
          bottom: '72px',
          left: textPadding,
          right: textPadding,
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          margin: 0,
          padding: 0,
          display: 'block',
        }}
      />
      
      {/* 대화 내용 - 글로우 효과 추가 */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          height: '50px',
          left: textPadding,
          right: textPadding,
          color: 'white',
          fontSize: '14px',
          lineHeight: 1.4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textShadow: `0 0 5px ${darkNavyBlue}`, // 어두운 군청색 외부 글로우
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {message.split('\n').map((line, index) => (
            // tslint:disable-next-line:react-no-array-index-key
            <React.Fragment key={index}>
              {index > 0 && <br />}
              {line ? line : <EmptyLine />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* 하단 삼각형 표시 */}
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
