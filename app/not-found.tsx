import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 not found',
};

const NOT_FOUND_OG_PARAMS = new URLSearchParams({
  type: 'aris',
  subType: '001',
  zoom: 'false',
  bg: 'abydos-desert',
});

const NOT_FOUND_OG_IMAGE_URL = `/api/og/${encodeURIComponent('404 not found.')}?${NOT_FOUND_OG_PARAMS.toString()}`;

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4">
      <img
        src={NOT_FOUND_OG_IMAGE_URL}
        alt="404 not found"
        width={600}
        height={315}
        className="w-full max-w-[600px] rounded-md shadow-md"
      />
      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
