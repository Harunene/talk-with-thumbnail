import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  // 로컬 개발 환경에서만 활성화. 배포 환경에서는 404 반환
  const enabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_STATS === 'true';
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { blobs } = await list({
      prefix: 'messages/',
      limit: 1000,
    });

    const messages = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return {
            ...data,
            createdAt: blob.uploadedAt,
            url: blob.url,
            pathname: blob.pathname,
          };
        } catch (error) {
          console.error(`Failed to fetch ${blob.url}:`, error);
          return null;
        }
      })
    );

    const validMessages = messages.filter(Boolean);

    const typeStats: Record<string, number> = {};
    const wordFrequency: Record<string, number> = {};
    
    validMessages.forEach((msg) => {
      const type = msg.imageType || 'default';
      typeStats[type] = (typeStats[type] || 0) + 1;
      
      const words = msg.message
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter((word: string) => word.length > 1);
      
      words.forEach((word: string) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    const sortedWords = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100)
      .map(([text, value]) => ({ text, value }));

    const recentMessages = validMessages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalCount: validMessages.length,
      typeStats,
      wordCloud: sortedWords,
      recentMessages,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}