import ThumbnailReview from '@/components/ThumbnailReview';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '썸네일 Preview',
  description: '전 캐릭터 OG Preview 비교',
};

export default function ThumbnailReviewPage() {
  return <ThumbnailReview />;
}
