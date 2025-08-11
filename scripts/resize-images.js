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
    
    // 결과 이미지를 세로 768px로 리사이즈 (비율 유지, 업스케일 금지)
    sharp(inputPath)
      .resize({ 
        height: 768,
        withoutEnlargement: true
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