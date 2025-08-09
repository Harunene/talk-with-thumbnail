#!/usr/bin/env node
/*
  Migration script: normalize blob filenames under a prefix by removing random suffixes.
  - From: messages/<id>-<random>.json
  - To:   messages/<id>.json

  Usage:
    node scripts/migrate-blobs.js [--prefix messages/] [--dry-run] [--keep]

  Notes:
    - Requires BLOB_READ_WRITE_TOKEN to be available in env if not using Vercel zero-config.
*/

/* eslint-disable no-console */
const { list, head, copy, del } = require('@vercel/blob');

async function main() {
  const args = process.argv.slice(2);
  const getFlag = (name, def = false) => args.includes(name) ? true : def;
  const getArgValue = (name, def) => {
    const idx = args.indexOf(name);
    if (idx === -1) return def;
    return args[idx + 1] || def;
  };

  const dryRun = getFlag('--dry-run');
  const keepSource = getFlag('--keep');
  const prefix = getArgValue('--prefix', 'messages/');

  console.log(`Starting blob migration`);
  console.log(` - prefix: ${prefix}`);
  console.log(` - dryRun: ${dryRun}`);
  console.log(` - keepSource: ${keepSource}`);

  // List all blobs under prefix
  const { blobs } = await list({ prefix });
  console.log(`Found ${blobs.length} blobs under '${prefix}'`);

  let migrated = 0;
  let skipped = 0;
  let deleted = 0;
  let copied = 0;

  for (const b of blobs) {
    const { pathname, url } = b;
    // 실제 저장 경로는 url 기준으로 파싱 (pathname과 불일치할 수 있음)
    let pathFromUrl = pathname;
    try {
      const u = new URL(url);
      pathFromUrl = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    } catch (_) {
      pathFromUrl = pathname;
    }

    // Match suffix pattern: messages/<base>-<suffix>.json
    const match = pathFromUrl.match(/^([^\s]+\/)([^\/]+?)(?:-([A-Za-z0-9]+))?(\.json)$/);
    if (!match) {
      console.log(`SKIP (no-match): ${pathFromUrl}`);
      skipped++;
      continue;
    }

    const folder = match[1]; // e.g., messages/
    const base = match[2];   // e.g., abcdef12 or abcdef12-xyz (if no suffix captured)
    const hasSuffix = Boolean(match[3]);
    const ext = match[4];

    if (!hasSuffix) {
      // Already canonical
      console.log(`SKIP (no-suffix): ${pathFromUrl}`);
      skipped++;
      continue;
    }

    const destPath = `${folder}${base}${ext}`; // messages/<base>.json

    // If destination exists, skip copy but consider deleting duplicate source
    let destExists = false;
    try {
      await head(destPath);
      destExists = true;
    } catch (_) {
      destExists = false;
    }

    if (!destExists) {
      console.log(`COPY: ${pathFromUrl} -> ${destPath}`);
      if (!dryRun) {
        await copy(url, destPath, { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
      }
      copied++;
    } else {
      // Optional: could compare sizes to be extra safe
      console.log(`DEST EXISTS: ${destPath} (skip copy)`);
    }

    if (!keepSource) {
      console.log(`DELETE: ${url}`);
      if (!dryRun) {
        await del(url);
      }
      deleted++;
    }

    migrated++;
  }

  console.log(`\nDone.`);
  console.log(` - migrated: ${migrated}`);
  console.log(` - copied:   ${copied}`);
  console.log(` - deleted:  ${deleted}`);
  console.log(` - skipped:  ${skipped}`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});


