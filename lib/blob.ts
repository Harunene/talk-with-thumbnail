import { nanoid } from 'nanoid';
import { put, head } from '@vercel/blob';
import crypto from 'crypto';

// 메시지를 위한 기본 경로
const MESSAGE_PATH = 'messages';

// 메시지 데이터 인터페이스
export interface MessageData {
  message: string;
  imageType?: string; // 이미지 유형 (기본값: 'default')
  subType?: string; // 이미지 서브타입 (블루 아카이브 캐릭터용)
  zoomMode?: boolean; // 확대 모드 여부
}

// 메시지의 해시 ID 생성 함수
function generateHashId(data: MessageData): string {
  // 메시지와 이미지 타입, 이미지 서브타입을 함께 해시
  const hashContent = `${data.message}|${data.imageType || 'default'}|${data.subType || ''}|${data.zoomMode || ''}`;
  // SHA-256 해시 생성 (충돌 가능성 매우 낮음)
  const hash = crypto.createHash('sha256').update(hashContent).digest('hex');
  // 첫 8자리만 사용 (충분히 고유하면서 짧은 ID)
  return hash.substring(0, 8);
}

// 메시지 저장 함수
export async function storeMessage(data: MessageData): Promise<string> {
  // 데이터 정리 및 기본값 설정
  const messageData: MessageData = {
    message: data.message.trim(),
    imageType: data.imageType || 'default',
    subType: data.subType,
    zoomMode: data.zoomMode || false
  };
  
  // 해시 기반 ID 생성
  const id = generateHashId(messageData);
  
  // 파일 이름 생성
  const fileName = `${MESSAGE_PATH}/${id}.json`;
  
  // Blob에 JSON 형태로 데이터 저장
  const blob = await put(fileName, JSON.stringify(messageData), {
    contentType: 'application/json',
    access: 'public',
  });
  
  return id;
}

// ID로 메시지 데이터 조회 함수
export async function getMessageData(id: string): Promise<MessageData | null> {
  try {
    // 정확한 파일 경로로 단건 조회
    const fileName = `${MESSAGE_PATH}/${id}.json`;
    let info;
    try {
      info = await head(fileName);
    } catch (_) {
      // 존재하지 않는 경우 등
      return null;
    }

    const response = await fetch(info.downloadUrl || info.url);
    if (!response.ok) {
      console.error(`파일 조회 실패: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // JSON 파싱
    const data = await response.json();
    return data as MessageData;
  } catch (error) {
    console.error('메시지 데이터 조회 실패:', error);
    return null;
  }
}

// ID로 메시지만 조회하는 간편 함수 (이전 버전 호환용)
export async function getMessage(id: string): Promise<string | null> {
  const data = await getMessageData(id);
  return data ? data.message : null;
}
