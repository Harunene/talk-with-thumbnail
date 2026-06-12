'use client';

import PreviewEditor from '@/components/PreviewEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { resolveBackgroundId } from '@/lib/backgrounds';
import { CHARACTER_IDS, CHARACTERS, type CharacterId } from '@/lib/characters';
import { useThrottle } from '@/lib/useThrottle.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_MESSAGE = '썸네일 미리보기 테스트입니다.';

const SORTED_CHARACTER_IDS = [...CHARACTER_IDS].sort(
  (a, b) => CHARACTERS[a].heightCm - CHARACTERS[b].heightCm,
);

function buildStyleImageUrl(
  characterId: CharacterId,
  subType: string,
  zoomMode: boolean,
  backgroundId: string,
): string {
  const params = new URLSearchParams({
    type: characterId,
    subType,
    zoom: String(zoomMode),
    bg: backgroundId,
    nomsg: 'true',
  });
  return `/api/og/?${params.toString()}`;
}

function ReviewPreviewCard({
  characterId,
  zoomMode,
}: {
  characterId: CharacterId;
  zoomMode: boolean;
}) {
  const config = CHARACTERS[characterId];
  const backgroundId = resolveBackgroundId(undefined, config.defaultBackgroundId);
  const imageUrl = buildStyleImageUrl(
    characterId,
    config.defaultExpression,
    zoomMode,
    backgroundId,
  );
  const throttledImageUrl = useThrottle(imageUrl, 500);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [throttledImageUrl]);

  return (
    <PreviewEditor
      imageUrl={throttledImageUrl}
      value=""
      onChange={() => {}}
      zoomMode={zoomMode}
      isLoading={isLoading}
      onImageLoad={() => setIsLoading(false)}
      interactive={false}
    />
  );
}

export default function ThumbnailReview() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [zoomMode, setZoomMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
  const [selectedId, setSelectedId] = useState<CharacterId>('hikari');

  const selectedConfig = CHARACTERS[selectedId];
  const selectedBackgroundId = resolveBackgroundId(
    undefined,
    selectedConfig.defaultBackgroundId,
  );
  const singleImageUrl = useMemo(
    () =>
      buildStyleImageUrl(
        selectedId,
        selectedConfig.defaultExpression,
        zoomMode,
        selectedBackgroundId,
      ),
    [selectedId, selectedConfig.defaultExpression, zoomMode, selectedBackgroundId],
  );
  const throttledSingleImageUrl = useThrottle(singleImageUrl, 500);
  const [isSingleLoading, setIsSingleLoading] = useState(true);

  useEffect(() => {
    setIsSingleLoading(true);
  }, [throttledSingleImageUrl]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">썸네일 Preview</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              홈과 동일한 PreviewEditor + OG API로 미리봅니다.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">홈으로</Link>
          </Button>
        </header>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">옵션</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="zoom-mode"
                checked={zoomMode}
                onCheckedChange={(checked) => setZoomMode(checked === true)}
              />
              <Label htmlFor="zoom-mode">크기 확대</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode">보기</Label>
              <Select
                value={viewMode}
                onValueChange={(value: 'grid' | 'single') => setViewMode(value)}
              >
                <SelectTrigger id="view-mode" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">단일 Preview</SelectItem>
                  <SelectItem value="grid">전체 그리드</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewMode === 'single' ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="character-select">캐릭터</Label>
                <Select
                  value={selectedId}
                  onValueChange={(value) => setSelectedId(value as CharacterId)}
                >
                  <SelectTrigger id="character-select" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTED_CHARACTER_IDS.map((characterId) => (
                      <SelectItem key={characterId} value={characterId}>
                        {CHARACTERS[characterId].name} ({CHARACTERS[characterId].heightCm}cm)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {viewMode === 'single' ? (
          <div className="mx-auto max-w-[640px] space-y-4">
            <PreviewEditor
              imageUrl={throttledSingleImageUrl}
              value={message}
              onChange={setMessage}
              zoomMode={zoomMode}
              isLoading={isSingleLoading}
              onImageLoad={() => setIsSingleLoading(false)}
            />
            <p className="text-center text-sm text-muted-foreground">
              {selectedConfig.name} · {selectedConfig.heightCm}cm
            </p>
          </div>
        ) : null}

        {viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SORTED_CHARACTER_IDS.map((characterId) => {
              const config = CHARACTERS[characterId];
              return (
                <Card key={characterId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {config.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {config.heightCm}cm
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewPreviewCard characterId={characterId} zoomMode={zoomMode} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
