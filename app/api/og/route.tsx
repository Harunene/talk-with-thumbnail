import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import Preview, { ImageType } from '@/components/Preview'
import { commonImageResponse } from '@/lib/commonImageResponse'

export const runtime = "edge"

// 24시간 캐시 설정
export const revalidate = 86400

export async function GET(req: NextRequest) {

  const defaultMessage = '하고싶은 말'
  const { searchParams } = new URL(req.url);
  const imageType = searchParams.get('type') as ImageType || 'sana_stare';
  const subType = searchParams.get('subType') || '';

  const origin = req.headers.get('host') || 'localhost:3000'
  const protocol = origin.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${origin}`

  return commonImageResponse(baseUrl, defaultMessage, imageType, subType)
} 
