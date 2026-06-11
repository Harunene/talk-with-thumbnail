import { NextRequest } from 'next/server'
import { isCharacterId } from '@/lib/characters'
import { commonImageResponse } from '@/lib/commonImageResponse'
import { getBaseUrlFromRequest } from '@/lib/getBaseUrl'
import { resolveOgMessage } from '@/lib/resolveOgMessage'
export const runtime = "edge"

type Params = {
  message: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { message } = await params
  const { searchParams } = new URL(req.url);
  const hideMessage = searchParams.get('nomsg') === 'true';
  const safeMessage = resolveOgMessage(decodeURIComponent(message).slice(0, 200), hideMessage);
  const typeParam = searchParams.get('type') || 'hikari';
  const imageType = isCharacterId(typeParam) ? typeParam : 'hikari';
  const subType = searchParams.get('subType') || '';
  const zoomMode = searchParams.get('zoom') === 'true';
  const backgroundId = searchParams.get('bg') || undefined;

  const baseUrl = getBaseUrlFromRequest(req)

  return commonImageResponse(baseUrl, safeMessage, imageType, subType, zoomMode, backgroundId)
}
