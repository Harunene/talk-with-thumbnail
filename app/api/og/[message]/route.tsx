import { NextRequest } from 'next/server'
import { ImageType } from '@/components/Preview'
import { commonImageResponse } from '@/lib/commonImageResponse'
import { getBaseUrlFromRequest } from '@/lib/getBaseUrl'
export const runtime = "edge"

type Params = {
  message: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { message } = await params
  const safeMessage = decodeURIComponent(message).slice(0, 200).trim() || '하고싶은 말'
  const { searchParams } = new URL(req.url);
  const imageType = searchParams.get('type') as ImageType || 'sana_stare';
  const subType = searchParams.get('subType') || '';
  const zoomMode = searchParams.get('zoom') === 'true';

  const baseUrl = getBaseUrlFromRequest(req)

  return commonImageResponse(baseUrl, safeMessage, imageType, subType, zoomMode)
} 
