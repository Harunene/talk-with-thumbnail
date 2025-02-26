import Home from '@/components/Home'
import { Metadata, ResolvingMetadata } from 'next'

interface Props {
  params: {}
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const message = typeof searchParams.message === 'string' ? searchParams.message : ''
  const encodedMessage = encodeURIComponent(message || '하고싶은 말')

  const VERCEL_URL = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
  const host = `https://${VERCEL_URL}`
  const ogImageUrl = `${host}/api/og/${encodedMessage}`
  
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
