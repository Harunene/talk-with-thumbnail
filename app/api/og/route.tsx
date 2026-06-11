import { NextRequest } from 'next/server'
import { isCharacterId } from '@/lib/characters'
import { commonImageResponse } from '@/lib/commonImageResponse'
import { getBaseUrlFromRequest } from '@/lib/getBaseUrl'
import { resolveOgMessage } from '@/lib/resolveOgMessage'

export const runtime = "edge"

export const revalidate = 86400

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type') || 'hikari';
  const imageType = isCharacterId(typeParam) ? typeParam : 'hikari';
  const subType = searchParams.get('subType') || '';
  const zoomMode = searchParams.get('zoom') === 'true';
  const backgroundId = searchParams.get('bg') || undefined;
  const hideMessage = searchParams.get('nomsg') === 'true';
  const message = resolveOgMessage('', hideMessage);

  const baseUrl = getBaseUrlFromRequest(req)

  return commonImageResponse(baseUrl, message, imageType, subType, zoomMode, backgroundId)
}
