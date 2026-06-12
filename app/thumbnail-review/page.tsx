import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { CHARACTER_CATALOG } from '@/lib/characterCatalog';
import { formatFaceCropParam } from '@/lib/debug/thumbnailLayout';
import { referenceExpressionId } from '@/lib/portraitMatch';

interface MatchSummary {
  score: number | null;
  scale: number | null;
  method: string | null;
  faceCrop: { left: number; top: number; width: number; height: number } | null;
  error?: string | null;
  goodMatches?: number | null;
  inliers?: number | null;
  inlierRatio?: number | null;
}

interface ReviewRow {
  id: string;
  name: string;
  referenceSprite: string | null;
  matchSpriteCentered?: boolean;
  defaultBackgroundId: string;
  portraitFile: string | null;
  sift: MatchSummary;
  matchScore: number | null;
  matchScale: number | null;
  matchMethod: string | null;
  anchorX: number | null;
  catalogFaceCrop: { left: number; top: number; width: number; height: number } | null;
  portraitFaceCrop: { left: number; top: number; width: number; height: number } | null;
  faceCropDistance: number | null;
  centeredFaceCrop: { left: number; top: number; width: number; height: number } | null;
  centeredWidth: number | null;
  centeredAnchorX: number | null;
  padLeft: number | null;
  padRight: number | null;
  centerMethod: string | null;
}

function expressionFromReference(referenceSprite: string | null, characterId: string) {
  const matched = referenceSprite?.match(/_(\d{3})\./);
  return matched?.[1] ?? referenceExpressionId(characterId as keyof typeof CHARACTER_CATALOG);
}

function buildSpriteRectDebugUrl(
  row: ReviewRow,
  options: {
    faceCrop?: { left: number; top: number; width: number; height: number } | null;
    centered?: boolean;
  } = {},
) {
  if (!options.faceCrop) return null;

  const params = new URLSearchParams({
    type: row.id,
    faceCrop: formatFaceCropParam(options.faceCrop),
    expr: expressionFromReference(row.referenceSprite, row.id),
  });
  if (options.centered) {
    params.set('centered', '1');
  }

  return `/api/sprite-rect-debug?${params.toString()}`;
}

function buildFaceIconPath(characterId: string) {
  return `/images/bluearchive/char_face/${characterId}/up_${characterId}_001.png`;
}

function RectPreview({
  row,
  faceCrop,
  centered,
  label,
}: {
  row: ReviewRow;
  faceCrop: { left: number; top: number; width: number; height: number } | null;
  centered?: boolean;
  label: string;
}) {
  if (!faceCrop) {
    return <div className="text-xs text-[#aaa]">{label}: 매칭 실패</div>;
  }

  const url = buildSpriteRectDebugUrl(row, { faceCrop, centered });
  const expr = expressionFromReference(row.referenceSprite, row.id);
  const spriteLabel = centered ? `centered / ${expr}` : `char_small / ${expr}`;

  return (
    <>
      <div className="text-xs text-[#9cf] mb-1">
        {label} · {spriteLabel}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url ?? ''} alt={`${row.id} ${label}`} className="max-h-[420px] w-auto rounded-lg bg-[#222]" />
      <div className="text-xs text-[#aaa] mt-2 font-mono">
        {faceCrop.width}×{faceCrop.height} @ L{faceCrop.left} T{faceCrop.top}
      </div>
    </>
  );
}

async function loadResults(): Promise<ReviewRow[]> {
  const filePath = path.join(process.cwd(), 'public/thumbnail-review/results.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as ReviewRow[];
}

export default async function ThumbnailReviewPage() {
  let rows: ReviewRow[] = [];
  let loadError: string | null = null;

  try {
    rows = await loadResults();
  } catch {
    loadError = 'results.json 없음. bun scripts/generate_thumbnail_comparison.js';
  }

  return (
    <main className="min-h-screen bg-[#111] text-[#eee] p-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold mb-2">faceCrop 검증 (SIFT)</h1>
        <p className="text-[#aaa] leading-relaxed mb-2 max-w-4xl">
          빨간 rect = 기준 스프라이트(001 등) 위에 SIFT faceCrop을 직접 오버레이합니다. OG Preview가
          아닌 sprite 픽셀 좌표 그대로 확인합니다.
        </p>
        {loadError ? (
          <p className="text-red-400 mb-6">{loadError}</p>
        ) : (
          <p className="text-[#aaa] mb-6">
            <code className="text-[#ffd27f]">bun scripts/generate_thumbnail_comparison.js</code>
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[#9cf] border-b border-[#333]">
                <th className="p-3">캐릭터</th>
                <th className="p-3">SIFT rect</th>
                <th className="p-3">centered (prod)</th>
                <th className="p-3">char_face</th>
                <th className="p-3">메타</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const config = CHARACTER_CATALOG[row.id as keyof typeof CHARACTER_CATALOG];
                const siftCrop = row.sift?.faceCrop ?? row.portraitFaceCrop;
                const centeredUrl = row.centeredFaceCrop
                  ? buildSpriteRectDebugUrl(row, {
                      faceCrop: row.centeredFaceCrop,
                      centered: true,
                    })
                  : null;
                const faceIconPath = buildFaceIconPath(row.id);

                return (
                  <tr key={row.id} className="border-b border-[#333] align-top">
                    <td className="p-3">
                      <strong>{row.name}</strong>
                      <br />
                      <code className="text-sm text-[#ffd27f]">{row.id}</code>
                      {config ? null : (
                        <div className="text-xs text-red-400">catalog 없음</div>
                      )}
                    </td>
                    <td className="p-3">
                      <RectPreview
                        row={row}
                        faceCrop={siftCrop}
                        label="sift"
                        centered={row.matchSpriteCentered}
                      />
                    </td>
                    <td className="p-3">
                      {centeredUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={centeredUrl}
                            alt={`${row.id} centered rect`}
                            className="w-[260px] rounded-lg bg-black"
                          />
                          <div className="text-xs text-[#aaa] mt-2 font-mono">
                            pad {row.padLeft}/{row.padRight} · {row.centerMethod}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-[#aaa]">center_sprites.js 미실행</div>
                      )}
                    </td>
                    <td className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={faceIconPath}
                        alt={`${row.id} face icon`}
                        className="w-[100px] h-[100px] rounded-lg bg-[#222] object-contain"
                      />
                    </td>
                    <td className="p-3 text-xs text-[#aaa] leading-relaxed font-mono">
                      sift: {row.sift?.score ?? '-'} / scale {row.sift?.scale ?? '-'}
                      {row.sift?.inliers != null ? (
                        <>
                          <br />
                          inliers {row.sift.inliers}/{row.sift.goodMatches}
                        </>
                      ) : null}
                      {row.sift?.error ? (
                        <>
                          <br />
                          <span className="text-red-400">{row.sift.error}</span>
                        </>
                      ) : null}
                      <br />
                      catalog dist: {row.faceCropDistance?.toFixed(0) ?? '-'}px
                      {centeredUrl ? (
                        <>
                          <br />
                          <Link href={centeredUrl} className="text-[#9cf] underline" target="_blank">
                            sprite rect
                          </Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
