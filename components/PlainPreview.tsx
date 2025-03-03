import type { PreviewProps } from './Preview';

export default function PlainPreview({ message, imageBaseUrl = '', imageType, subType = '' }: PreviewProps) {
  // 메시지 길이에 따른 글자 크기 조절을 위한 계산
  const isOneLine = !message.includes('\n');
  const messageLength = message.length;
  
  // 글자 크기 계산 함수 (메시지 길이에 반비례하게 조절)
  const calculateFontSize = () => {
    if (isOneLine) {
      if (messageLength <= 6) return 48;
      if (messageLength <= 10) return 32;
      if (messageLength <= 20) return 28;
      if (messageLength <= 30) return 24;
      if (messageLength <= 40) return 20;
      return 18;
    }
    
    const lines = message.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const lineCount = lines.length;
    
    // 줄 수와 최대 줄 길이에 따라 글자 크기 조절
    if (lineCount <= 2 && maxLineLength <= 15) return 24;
    if (lineCount <= 3 && maxLineLength <= 20) return 20;
    if (lineCount <= 4) return 18;
    return 16;
  };
  
  const fontSize = calculateFontSize() * 1.2;
  const imageName = `${imageType}.png`;
  const imageUrl = imageBaseUrl ? `${imageBaseUrl}/images/${imageName}` : `/images/${imageName}`;

  // 말풍선 너비 고정 (가로 크기 고정)
  const speechBubbleWidth = 350;
  
  // 말풍선 최소 높이 설정 (기본 높이)
  const minSpeechBubbleHeight = 80;
  
  // 메시지 길이에 따른 추가 높이 계산
  const calculateExtraHeight = () => {
    const lines = message.split('\n');
    const lineCount = lines.length;
    
    // 기본 높이에 줄 수에 따른 추가 높이 계산
    const lineHeight = fontSize * 1.5; // 줄 간격을 글자 크기의 1.5배로 설정
    return Math.max(0, (lineCount - 1) * lineHeight);
  };
  
  const extraHeight = calculateExtraHeight();
  const speechBubbleHeight = minSpeechBubbleHeight + extraHeight;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      {/* 캐릭터 이미지 */}
      <img
        src={imageUrl}
        alt="캐릭터"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '60px',
          width: '120px',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '5px',
          display: 'block',
        }}
      />
      
      {/* 말풍선 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '50px',
          width: `${speechBubbleWidth}px`,
          minHeight: `${speechBubbleHeight}px`,
          backgroundColor: 'white',
          borderRadius: '15px',
          border: '3px solid black',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translateY(-50%)', // 세로 중앙 정렬
        }}
      >
        {/* 말풍선 꼬리 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-15px',
            left: '0px',
            width: '30px',
            height: '30px',
            backgroundColor: 'white',
            border: '5px solid black',
            borderTop: 'none',
            borderRight: 'none',
            transform: 'scaleX(0.6) skewX(-65deg) rotate(-45deg)',
            transformOrigin: 'center',
            borderRadius: '10px',
          }}
        />
        
        {/* 텍스트 내용 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
          }}
        >
          <pre
            style={{
              display: 'flex',
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#333',
              fontFamily: 'Noto Sans CJK TC Bold, Arial, sans-serif',
              padding: '0px',
              margin: '0',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
              maxWidth: '100%',
            }}
          >
            {message}
          </pre>
        </div>
      </div>
    </div>
  );
}

