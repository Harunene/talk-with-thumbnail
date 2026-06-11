import { NextRequest } from 'next/server'
import { isCharacterId } from '@/lib/characters'
import { commonImageResponse } from '@/lib/commonImageResponse'
import { getBaseUrlFromRequest } from '@/lib/getBaseUrl'

export const runtime = "edge"

export const revalidate = 86400

export async function GET(req: NextRequest) {
  const defaultMessage = '하고싶은 말'
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type') || 'hikari';
  const imageType = isCharacterId(typeParam) ? typeParam : 'hikari';
  const subType = searchParams.get('subType') || '';
  const zoomMode = searchParams.get('zoom') === 'true';
  const backgroundId = searchParams.get('bg') || undefined;

  const baseUrl = getBaseUrlFromRequest(req)

  return commonImageResponse(baseUrl, defaultMessage, imageType, subType, zoomMode, backgroundId)
}
