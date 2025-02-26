import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = "edge"

export async function GET(
  req: NextRequest,
  { params }: { params: { message: string } }
) {
  try {
    // URL 경로에서 메시지 추출 (URL 디코딩 적용)
    const message = decodeURIComponent(params.message).slice(0, 100).trim() || ''
    const isOneLine = message.includes('\n') ? false : true
    
    // 로컬 개발 환경에서는 localhost:3000 사용
    const imageUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/images/sana.jpg`

    return new ImageResponse(
      (
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

          {/* 사나 이미지 */}
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
      ),
      {
        width: 600,
        height: 315,
        emoji: 'twemoji',
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`이미지 생성에 실패했습니다`, {
      status: 500,
    })
  }
} 