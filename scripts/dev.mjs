#!/usr/bin/env bun
import { existsSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

/** `next build` 산출물이 남아 있으면 Turbopack dev와 충돌해 ENOENT가 난다. */
const PRODUCTION_MARKERS = ['.next/BUILD_ID', '.next/export-marker.json'];

function hasProductionCache() {
  return PRODUCTION_MARKERS.some((path) => existsSync(path));
}

if (hasProductionCache()) {
  console.log('[dev] production build cache detected — clearing .next/');
  rmSync('.next', { recursive: true, force: true });
}

const nextBin = join(process.cwd(), 'node_modules', '.bin', 'next');
const child = spawn(nextBin, ['dev', '--turbopack'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
