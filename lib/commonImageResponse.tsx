import { ImageResponse } from '@vercel/og'
import type { CharacterId } from '@/lib/characters'
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

const loadFonts = async (baseUrl: string): Promise<FontOptions[] | undefined> => {
  const fetchFont = async (fontFileName: string): Promise<ArrayBuffer> => {
    const fontUrl = new URL(`/fonts/${fontFileName}`, baseUrl).toString();
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${fontUrl}, status: ${response.status}`);
    }
    return response.arrayBuffer();
  };

  return [
    {
      name: 'Gyeonggi Medium',
      data: await fetchFont('gyeonggi_medium.otf'),
      style: 'normal',
    },
  ];
};

export const commonImageResponse = async (
  baseUrl: string, 
  message: string, 
  imageType: CharacterId,
  subType?: string,
  zoomMode?: boolean,
  backgroundId?: string,
) => {
  try {
    const fonts = await loadFonts(baseUrl);

    return new ImageResponse(
      (
        <Preview 
          message={message} 
          imageBaseUrl={baseUrl} 
          imageType={imageType} 
          subType={subType}
          zoomMode={zoomMode}
          backgroundId={backgroundId}
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
