import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import Preview, { ImageType } from '@/components/Preview'

export const runtime = "edge"

// 24시간 캐시 설정
export const revalidate = 86400

export async function GET(req: NextRequest) {
  try {
    // 기본 메시지 설정
    const defaultMessage = '하고싶은 말'
    const { searchParams } = new URL(req.url);
    const imageType = searchParams.get('type') as ImageType || 'sana_stare';

    // 요청 헤더에서 호스트 추출
    const origin = req.headers.get('host') || 'localhost:3000'
    const protocol = origin.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${origin}`

    return new ImageResponse(
      (
        <Preview message={defaultMessage} imageBaseUrl={baseUrl} imageType={imageType} />
      ),
      {
        width: 600,
        height: 315,
        emoji: 'twemoji',
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (e: any) {
    console.log(`기본 이미지 생성 실패: ${e.message}`)
    return new Response(`Failed to generate the default image`, {
      status: 500,
    })
  }
} 