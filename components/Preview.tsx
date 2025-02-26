interface PreviewProps {
  message: string
  imageBaseUrl?: string // 이미지 기본 URL을 위한 선택적 프로퍼티 추가
}

export default function Preview({ message, imageBaseUrl = '' }: PreviewProps) {
  const isOneLine = message.includes('\n') ? false : true
  const imageUrl = imageBaseUrl ? `${imageBaseUrl}/images/sana.jpg` : '/images/sana.jpg';

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
            fontSize: isOneLine ? 48 : 24,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#333',
            fontFamily: 'Noto Sans CJK TC Bold, Arial, sans-serif',
            padding: '0px',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
          }}
        >
          {message}
        </pre>
      </div>
      
    </div>
  )
}
