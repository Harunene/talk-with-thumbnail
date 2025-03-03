import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const CHARACTERS = ['hikari', 'nozomi'];
const SOURCE_DIR = 'public/images/bluearchive/char_small';
const TARGET_DIR = 'public/images/bluearchive/char_face';

// 캐릭터별 얼굴 크롭 설정
const CROP_CONFIG = {
  hikari: {
    left: 171,   // 왼쪽에서부터의 거리
    top: 103,    // 위에서부터의 거리
    width: 100,  // 크롭할 너비
    height: 100  // 크롭할 높이
  },
  nozomi: {
    left: 145,
    top: 108,
    width: 100,
    height: 100
  }
}

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function cropFaces() {
  for (const character of CHARACTERS) {
    const sourceCharDir = path.join(SOURCE_DIR, character);
    const targetCharDir = path.join(TARGET_DIR, character);
    
    // 대상 디렉토리 생성
    await ensureDir(targetCharDir);
    
    // 소스 디렉토리의 모든 파일 읽기
    const files = await fs.readdir(sourceCharDir);
    
    for (const file of files) {
      if (!file.endsWith('.png')) continue;
      
      const sourcePath = path.join(sourceCharDir, file);
      const targetPath = path.join(targetCharDir, file);
      
      console.log(`Processing ${sourcePath}...`);
      
      try {
        // 이미지 크롭 및 저장
        await sharp(sourcePath)
          .extract(CROP_CONFIG[character])
          .toFile(targetPath);
        
        console.log(`Created ${targetPath}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

// 스크립트 실행
cropFaces().catch(console.error); 