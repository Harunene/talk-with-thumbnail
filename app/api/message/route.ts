import { NextRequest, NextResponse } from 'next/server';
import { storeMessage, MessageData } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { message, imageType } = body;
    
    // 메시지 검증
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: '유효한 메시지가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 메시지 길이 제한 (100자)
    const trimmedMessage = message.slice(0, 100).trim();
    
    // 메시지 데이터 준비
    const messageData: MessageData = {
      message: trimmedMessage,
      imageType: imageType || 'default' // 기본값 설정
    };
    
    // Blob에 저장
    const id = await storeMessage(messageData);
    
    // 성공 응답
    return NextResponse.json({ id, message: trimmedMessage, imageType: messageData.imageType });
  } catch (error) {
    console.error('메시지 저장 실패:', error);
    return NextResponse.json(
      { error: '메시지 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 