const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 캐릭터 폴더 경로
const charactersPath = path.join(__dirname, '../public/images/bluearchive/char');
const outputBasePath = path.join(__dirname, '../public/images/bluearchive/char_small');

// 출력 디렉토리가 없으면 생성
if (!fs.existsSync(outputBasePath)) {
  fs.mkdirSync(outputBasePath, { recursive: true });
}

// 캐릭터 폴더 목록 가져오기
const characterFolders = fs.readdirSync(charactersPath).filter(folder => {
  return fs.statSync(path.join(charactersPath, folder)).isDirectory();
});

console.log(`Found ${characterFolders.length} character folders: ${characterFolders.join(', ')}`);

// 각 캐릭터 폴더 처리
characterFolders.forEach(characterFolder => {
  const characterPath = path.join(charactersPath, characterFolder);
  const outputCharacterPath = path.join(outputBasePath, characterFolder);
  
  // 캐릭터별 출력 디렉토리 생성
  if (!fs.existsSync(outputCharacterPath)) {
    fs.mkdirSync(outputCharacterPath, { recursive: true });
  }
  
  // 이미지 파일 목록 가져오기
  const imageFiles = fs.readdirSync(characterPath).filter(file => {
    return file.endsWith('.png');
  });
  
  console.log(`Processing ${imageFiles.length} images for character ${characterFolder}`);
  
  // 각 이미지 파일 처리
  imageFiles.forEach(imageFile => {
    const inputPath = path.join(characterPath, imageFile);
    const outputPath = path.join(outputCharacterPath, imageFile);
    
    // 이미지 크기 줄이기 (1/10)
    sharp(inputPath)
      .resize({ 
        width: Math.round(4160 / 10), // 원본 너비의 1/10
        height: Math.round(7680 / 10), // 원본 높이의 1/10
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 투명 배경
      })
      .toFile(outputPath)
      .then(() => {
        console.log(`Resized ${inputPath} to ${outputPath}`);
      })
      .catch(err => {
        console.error(`Error resizing ${inputPath}:`, err);
      });
  });
});

console.log('Image resizing process started. Please wait for completion...'); 