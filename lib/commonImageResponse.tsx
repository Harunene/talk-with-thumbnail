import { ImageResponse } from '@vercel/og'
import Preview, { ImageType } from '@/components/Preview'

export const commonImageResponse = async (baseUrl: string, message: string, imageType: ImageType) => {
  try {
    
    const isBlueArchive = imageType === 'hikari' || imageType === 'nozomi';

    return new ImageResponse(
      (
        <Preview message={message} imageBaseUrl={baseUrl} imageType={imageType} />
      ),
      {
        width: 600,
        height: 315,
        emoji: 'twemoji',
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
        fonts: isBlueArchive ? [
          {
            name: 'Gyeonggi Medium',
            data: await fetch(new URL(`${baseUrl}/fonts/gyeonggi_medium.otf`, import.meta.url)).then(res => res.arrayBuffer()),
            style: 'normal',
          },
        ] : undefined,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}