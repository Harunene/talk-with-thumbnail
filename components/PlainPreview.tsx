import { PreviewProps } from './Preview';


export default function PlainPreview({ message, imageBaseUrl = '', imageType }: PreviewProps) {
  // 메시지 길이에 따른 글자 크기 조절을 위한 계산
  const isOneLine = !message.includes('\n');
  const messageLength = message.length;
  
  // 글자 크기 계산 함수 (메시지 길이에 반비례하게 조절)
  const calculateFontSize = () => {
    if (isOneLine) {
      if (messageLength <= 10) return 48;
      if (messageLength <= 20) return 40;
      if (messageLength <= 30) return 32;
      if (messageLength <= 40) return 28;
      return 24;
    } else {
      const lines = message.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      const lineCount = lines.length;
      
      // 줄 수와 최대 줄 길이에 따라 글자 크기 조절
      if (lineCount <= 2 && maxLineLength <= 15) return 32;
      if (lineCount <= 3 && maxLineLength <= 20) return 24;
      if (lineCount <= 4) return 18;
      return 20;
    }
  };
  
  const fontSize = calculateFontSize();
  const imageName = `${imageType}.jpg`;
  const imageUrl = imageBaseUrl ? `${imageBaseUrl}/images/${imageName}` : `/images/${imageName}`;

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
      {/* 사나 이미지 - 절대 URL 사용 */}
      <img
        src={imageUrl}
        alt="사나"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '60px',
          width: '120px',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '5px',
        }}
      />
      {/* 말풍선 div */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          width: '65%',
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '15px',
          border: '3px solid black',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 말풍선 꼬리 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-18px',
            left: '30px',
            width: '30px',
            height: '30px',
            backgroundColor: 'white',
            border: '3px solid black',
            borderTop: 'none',
            borderRight: 'none',
            transform: 'scaleX(0.6) skewX(-30deg) rotate(-45deg)',
            transformOrigin: 'center',
          }}
        />
        
        {/* 텍스트 내용 */}
        <pre
          style={{
            display: 'flex',
            fontSize,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
            fontFamily: 'Noto Sans CJK TC Bold, Arial, sans-serif',
            padding: '0px',
          }}
        >
          {message}
        </pre>
      </div>
      
    </div>
  )
}

