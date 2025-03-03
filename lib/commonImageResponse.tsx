import { ImageResponse } from '@vercel/og'
import type { ImageType } from '@/components/Preview'
import Preview from '@/components/Preview'

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = 'normal' | 'italic';
interface FontOptions {
    data: Buffer | ArrayBuffer;
    name: string;
    weight?: Weight;
    style?: FontStyle;
    lang?: string;
}

const loadFonts = async (baseUrl: string, imageType: ImageType): Promise<FontOptions[] | undefined> => {
  const isSans = imageType === 'sans';
  const isBlueArchive = imageType === 'hikari' || imageType === 'nozomi';

  if (isSans) {
    return [
      {
        name: 'DungGeunMo',
        data: await fetch(new URL(`${baseUrl}/fonts/DungGeunMo.otf`, import.meta.url)).then(res => res.arrayBuffer()),
        style: 'normal',
      },
    ];
  }

  if (isBlueArchive) {
    return [
      {
        name: 'Gyeonggi Medium',
        data: await fetch(new URL(`${baseUrl}/fonts/gyeonggi_medium.otf`, import.meta.url)).then(res => res.arrayBuffer()),
        style: 'normal',
      },
    ];
  }

  return undefined;
};

export const commonImageResponse = async (
  baseUrl: string, 
  message: string, 
  imageType: ImageType,
  subType?: string
) => {
  try {
    
    const isBlueArchive = imageType === 'hikari' || imageType === 'nozomi';
    const fonts = await loadFonts(baseUrl, imageType);

    return new ImageResponse(
      (
        <Preview 
          message={message} 
          imageBaseUrl={baseUrl} 
          imageType={imageType} 
          subType={subType}
        />
      ),
      {
        width: 600,
        height: 315,
        emoji: 'twemoji',
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
        fonts: fonts,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}