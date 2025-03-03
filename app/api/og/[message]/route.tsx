import { NextRequest } from 'next/server'
import { ImageType } from '@/components/Preview'
import { commonImageResponse } from '@/lib/commonImageResponse'
export const runtime = "edge"

export async function GET(
  req: NextRequest,
  { params }: { params: { message: string } }
) {
  const message = decodeURIComponent(params.message).slice(0, 100).trim() || '하고싶은 말'
  const { searchParams } = new URL(req.url);
  const imageType = searchParams.get('type') as ImageType || 'sana_stare';
  const subType = searchParams.get('subType') || '';

  const origin = req.headers.get('host') || 'localhost:3000'
  const protocol = origin.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${origin}`


  return commonImageResponse(baseUrl, message, imageType, subType)
} 
