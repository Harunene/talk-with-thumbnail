import { type NextRequest } from 'next/server';
import { type ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'; // 또는 headers() 사용시 타입

// NextRequest 사용 시
export function getBaseUrlFromRequest(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

// next/headers 사용 시 (Server Component 등)
export function getBaseUrlFromHeaders(headersList: ReadonlyHeaders): string {
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}
