import Home from '@/components/Home'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  // 프로덕션 도메인 설정
  const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'talk.nene.dev'
  const host = `https://${PRODUCTION_URL}`
  const ogImageUrl = `${host}/api/og/`

  return {
    title: 'Talk with thumbnail',
    description: '썸네일로 말해요',
    openGraph: {
      type: "article",
      title: 'Talk with thumbnail',
      description: '썸네일로 말해요',
      images: ogImageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Talk with thumbnail',
      description: '썸네일로 말해요',
      images: ogImageUrl,
    },
  }
}

export default function Page() {
  return (
    <Home />
  )
}
