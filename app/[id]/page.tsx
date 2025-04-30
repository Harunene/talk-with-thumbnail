import Home from '@/components/Home'
import type { Metadata, ResolvingMetadata } from 'next'
import { getMessage, getMessageData } from '@/lib/blob'
import { headers } from 'next/headers'
import { Suspense } from 'react'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  // ID로 Blob에서 메시지 조회
  const messageData = await getMessageData(id)
  const encodedMessage = encodeURIComponent(messageData?.message || '')
  const imageType = messageData?.imageType || 'sana_stare'
  const subType = messageData?.subType || ''
  const zoomMode = messageData?.zoomMode || false

  // 프로덕션 도메인 설정 - 환경변수 또는 하드코딩된 도메인 사용
  const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'talk.nene.dev'
  const host = `https://${PRODUCTION_URL}`
  const ogImageUrl = `${host}/api/og/${encodedMessage}?type=${imageType}&subType=${subType}&zoom=${zoomMode}`
  
  // UserAgent 확인
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || '';
  const isDiscordBot = userAgent.includes('Discordbot');
  
  // Discord 봇인 경우 twitter.title을 빈 문자열로, 아닌 경우 '.'로 설정
  const twitterTitle = isDiscordBot ? '' : '.';

  return {
    title: '',
    description: '썸네일로 말해요',
    openGraph: {
      type: "article",
      title: '',
      description: '썸네일로 말해요',
      images: ogImageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: '썸네일로 말해요',
      images: ogImageUrl,
    },
  }
}

export default async function Page(props: Props) {
  const { id } = await props.params

  // 로딩 상태를 보여줄 간단한 fallback UI
  const LoadingFallback = () => <div>Loading...</div>;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Home messageId={id} />
    </Suspense>
  )
} 