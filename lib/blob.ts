import { nanoid } from 'nanoid';
import { put, list } from '@vercel/blob';
import crypto from 'crypto';

// 메시지를 위한 기본 경로
const MESSAGE_PATH = 'messages';

// 메시지 데이터 인터페이스
export interface MessageData {
  message: string;
  imageType?: string; // 이미지 유형 (기본값: 'default')
}

// 메시지의 해시 ID 생성 함수
function generateHashId(data: MessageData): string {
  // 메시지와 이미지 타입을 함께 해시
  const hashContent = `${data.message}|${data.imageType || 'default'}`;
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
    imageType: data.imageType || 'default'
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
    // ID에 해당하는 파일 찾기
    const { blobs } = await list({
      prefix: `${MESSAGE_PATH}/${id}`,
    });
    
    // 파일이 없으면 null 반환
    if (blobs.length === 0) {
      console.log(`ID로 시작하는 메시지를 찾을 수 없음: ${id}`);
      return null;
    }
    
    // 첫 번째 일치하는 파일 사용
    const blob = blobs[0];
    console.log(`메시지 파일 찾음: ${blob.pathname}`);
    
    // 파일 내용 조회
    const response = await fetch(blob.url);
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

// 이미 존재하는 메시지의 ID 찾기
export async function getExistingMessageId(message: string): Promise<string | null> {
  // Blob에서는 이 기능을 효율적으로 구현하기 어려움
  // 단순 구현만 제공 (실제로는 많은 메시지가 있을 경우 비효율적)
  try {
    const { blobs } = await list({ prefix: MESSAGE_PATH });
    
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const content = await response.text();
      
      if (content === message) {
        // 파일 이름에서 ID 추출 (messages/ID.txt 형식)
        const fileName = blob.pathname.split('/').pop() || '';
        // ID 추출 (패턴 매칭으로 처리)
        const idMatch = fileName.match(/^([a-zA-Z0-9_-]{8})/);
        if (idMatch) {
          return idMatch[1];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('메시지 검색 실패:', error);
    return null;
  }
} 