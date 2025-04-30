import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import Preview, { ImageType } from '@/components/Preview'
import { commonImageResponse } from '@/lib/commonImageResponse'
import { getBaseUrlFromRequest } from '@/lib/getBaseUrl'

export const runtime = "edge"

// 24시간 캐시 설정
export const revalidate = 86400

export async function GET(req: NextRequest) {

  const defaultMessage = '하고싶은 말'
  const { searchParams } = new URL(req.url);
  const imageType = searchParams.get('type') as ImageType || 'sana_stare';
  const subType = searchParams.get('subType') || '';
  const zoomMode = searchParams.get('zoom') === 'true';

  const baseUrl = getBaseUrlFromRequest(req)

  return commonImageResponse(baseUrl, defaultMessage, imageType, subType, zoomMode)
} 
