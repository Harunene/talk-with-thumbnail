import { NextRequest, NextResponse } from 'next/server';
import { getMessageData } from '@/lib/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 메시지 데이터 조회
    const messageData = await getMessageData(id);
    
    if (!messageData) {
      return NextResponse.json(
        { error: '메시지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 성공 응답
    return NextResponse.json(messageData);
  } catch (error) {
    console.error('메시지 조회 실패:', error);
    return NextResponse.json(
      { error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 