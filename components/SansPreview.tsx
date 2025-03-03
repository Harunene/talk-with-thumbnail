import type { PreviewProps } from './Preview';

export default function SansPreview({ message, imageBaseUrl = '', imageType, subType = '' }: PreviewProps) {
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
  
  const bgImageUrl = imageBaseUrl ? `${imageBaseUrl}/images/sans/bg.jpg` : '/images/sans/bg.jpg';
  
  // 말풍선 너비 고정 (가로 크기 고정)
  const speechBubbleWidth = 300;
  
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

  // 픽셀화된 테두리 스타일 (도트 그래픽 효과)
  const pixelatedBorder = {
    borderStyle: 'solid',
    borderWidth: '4px',
    borderColor: 'black',
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        position: 'relative',
        imageRendering: 'pixelated' as const,
      }}
    >
      {/* 배경 이미지 */}
      <img
        src={bgImageUrl}
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
            
      {/* 말풍선 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '50px',
          width: `${speechBubbleWidth}px`,
          minHeight: `${speechBubbleHeight}px`,
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: 'translateY(-50%)', // 세로 중앙 정렬
          imageRendering: 'pixelated'
        }}
      >
        {/* 말풍선 꼬리 */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '-20px',
            width: '50px',
            height: '50px',
            backgroundColor: 'white',
            transform: 'scaleY(0.3) rotate(45deg)',
            borderRadius: '6px',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* 텍스트 내용 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <pre
            style={{
              display: 'flex',
              margin: 0,
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              textAlign: 'left',
              color: '#000',
              fontSmooth: 'never',
              fontFamily: '"Determination Mono", "Press Start 2P", monospace', // 픽셀 폰트 사용
              padding: '0px',
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