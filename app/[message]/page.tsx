import Home from '@/components/Home'
import { Metadata, ResolvingMetadata } from 'next'

interface Props {
  params: { message: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // URL 경로에서 메시지 추출 (URL 디코딩 적용)
  const message = decodeURIComponent(params.message)
  
  return {
    title: '말풍선 썸네일 생성기',
    description: '간단하게 말풍선 썸네일을 만들어보세요.',
    openGraph: {
      title: '말풍선 썸네일 생성기',
      description: '간단하게 말풍선 썸네일을 만들어보세요.',
      images: [{
        url: `/api/og/${params.message}`,
        width: 600,
        height: 315,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: '말풍선 썸네일 생성기',
      description: '간단하게 말풍선 썸네일을 만들어보세요.',
      images: [`/api/og/${params.message}`],
    },
  }
}

export default function Page() {
  return (
    <Home />
  )
} 