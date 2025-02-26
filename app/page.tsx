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
  
  // URL 메타데이터 구성 (message 파라미터를 경로 파라미터로 사용)
  const encodedMessage = encodeURIComponent(message || '하고싶은 말')
  
  return {
    title: '말풍선 썸네일 생성기',
    description: '간단하게 말풍선 썸네일을 만들어보세요.',
    openGraph: {
      title: '말풍선 썸네일 생성기',
      description: '간단하게 말풍선 썸네일을 만들어보세요.',
      images: [{
        url: `/api/og/${encodedMessage}`,
        width: 600,
        height: 315,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: '말풍선 썸네일 생성기',
      description: '간단하게 말풍선 썸네일을 만들어보세요.',
      images: [`/api/og/${encodedMessage}`],
    },
  }
}

export default function Page() {
  return (
    <Home />
  )
}
