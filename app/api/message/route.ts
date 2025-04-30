import { type NextRequest, NextResponse } from 'next/server';
import { storeMessage, type MessageData } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { message, imageType, subType, zoomMode } = body;
    
    // 메시지 검증
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: '유효한 메시지가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 메시지 길이 제한 (200자)
    const trimmedMessage = message.slice(0, 200).trim();
    
    // 메시지 데이터 준비
    const messageData: MessageData = {
      message: trimmedMessage,
      imageType: imageType || 'default',
      subType: subType || '',
      zoomMode: zoomMode || false
    };
    
    // Blob에 저장
    const id = await storeMessage(messageData);
    
    // 성공 응답
    return NextResponse.json({ id, message: trimmedMessage, imageType: messageData.imageType, subType: messageData.subType, zoomMode: messageData.zoomMode });
  } catch (error) {
    console.error('메시지 저장 실패:', error);
    return NextResponse.json(
      { error: '메시지 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 