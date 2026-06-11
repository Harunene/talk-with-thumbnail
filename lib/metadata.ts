import type { Metadata } from 'next';

// Twitter/X가 빈 제목일 때 URL 도메인으로 대체하는 것을 피하기 위한 최소 제목
export const MINIMAL_CARD_TITLE = '\u200B.';

export function getSiteHost(): string {
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'talk.nene.dev';
  return `https://${productionUrl}`;
}

export function buildOgImageUrl(
  host: string,
  params: {
    message?: string;
    imageType: string;
    subType?: string;
    zoomMode?: boolean;
    backgroundId?: string;
  }
): string {
  const encodedMessage = encodeURIComponent(params.message || '');
  const base = params.message?.trim()
    ? `${host}/api/og/${encodedMessage}`
    : `${host}/api/og/`;

  const searchParams = new URLSearchParams({
    type: params.imageType,
    subType: params.subType || '',
    zoom: String(params.zoomMode || false),
  });

  if (params.backgroundId) {
    searchParams.set('bg', params.backgroundId);
  }

  return `${base}?${searchParams.toString()}`;
}

export function buildShareMetadata(
  ogImageUrl: string,
  options?: { isDiscordBot?: boolean }
): Metadata {
  const title = options?.isDiscordBot ? '' : MINIMAL_CARD_TITLE;

  return {
    title,
    description: MINIMAL_CARD_TITLE,
    openGraph: {
      type: 'article',
      title,
      description: MINIMAL_CARD_TITLE,
      images: [
        {
          url: ogImageUrl,
          width: 600,
          height: 315,
          alt: '',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: MINIMAL_CARD_TITLE,
      images: [ogImageUrl],
    },
  };
}
