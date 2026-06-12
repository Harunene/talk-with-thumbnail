import path from 'node:path';
import { spawn } from 'node:child_process';

const SCRIPT = path.join(import.meta.dirname, '../scripts/detect_face_icon.py');

export interface FaceIconCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FaceIconDetectResult {
  method: string;
  siftScore: number;
  siftScale: number;
  faceScore: number;
  siftFaceCrop: FaceIconCrop;
  faceBoxPatch: FaceIconCrop;
  iconCrop: FaceIconCrop;
  error?: string;
}

export function runFaceIconDetector(spritePath: string, portraitPath: string): Promise<FaceIconDetectResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [SCRIPT, '--sprite', spritePath, '--portrait', portraitPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `detect_face_icon exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout.trim()) as FaceIconDetectResult);
      } catch (error) {
        reject(new Error(`Invalid detect_face_icon output: ${stdout.trim()} (${String(error)})`));
      }
    });
  });
}
