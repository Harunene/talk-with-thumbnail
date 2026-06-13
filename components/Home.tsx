"use client";
import posthog from "posthog-js";
import BackgroundPicker from "@/components/BackgroundPicker";
import ExpressionPicker from "@/components/ExpressionPicker";
import ImageRadioItem from "@/components/ImageRadioItem";
import PreviewEditor from "@/components/PreviewEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { MessageData } from "@/lib/blob";
import {
  CHARACTER_IDS,
  CHARACTERS,
  isCharacterId,
  type CharacterId,
} from "@/lib/characters";
import { resolveBackgroundId } from "@/lib/backgrounds";
import { createEditorInitialState } from "@/lib/initialEditorState";
import { cn } from "@/lib/utils";
import { useThrottle } from '@/lib/useThrottle.js';
import { Share2Icon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface HomeProps {
  messageId?: string;
  initialData?: MessageData | null;
}

export default function Home({ messageId = '', initialData = null }: HomeProps) {
  const { toast } = useToast();
  const router = useRouter();
  const initialState = createEditorInitialState(messageId, initialData);

  const [userMessage, setUserMessage] = useState(initialState.userMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [currentId, setCurrentId] = useState(initialState.currentId);
  const [imageType, setImageType] = useState<CharacterId>(initialState.imageType);
  const [subType, setSubType] = useState(initialState.subType);
  const [backgroundId, setBackgroundId] = useState(initialState.backgroundId);
  const [lastSubTypes, setLastSubTypes] = useState<Record<CharacterId, string>>(
    initialState.lastSubTypes,
  );
  const [lastBackgroundIds, setLastBackgroundIds] = useState<Record<CharacterId, string>>(
    initialState.lastBackgroundIds,
  );
  const [zoomMode, setZoomMode] = useState(initialState.zoomMode);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isPreviewStuck, setIsPreviewStuck] = useState(false);
  const previewSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = previewSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPreviewStuck(!entry.isIntersecting),
      { threshold: [0] },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  const resetShareId = () => {
    if (currentId) setCurrentId('');
  };

  const styleImageParams = new URLSearchParams({
    type: imageType,
    subType,
    zoom: String(zoomMode),
    bg: resolveBackgroundId(backgroundId, CHARACTERS[imageType].defaultBackgroundId),
    nomsg: 'true',
  });
  const editorImageUrl = `/api/og/?${styleImageParams.toString()}`;

  const saveMessageIfNeeded = async (): Promise<string | null> => {
    if (!userMessage.trim()) {
      toast({
        title: "메시지를 입력해주세요.",
        variant: "destructive",
      });
      return null;
    }

    if (currentId) return currentId;

    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-posthog-distinct-id': posthog.get_distinct_id(),
      },
      body: JSON.stringify({
        message: userMessage,
        imageType,
        subType,
        zoomMode,
        backgroundId: resolveBackgroundId(backgroundId, CHARACTERS[imageType].defaultBackgroundId),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      throw new Error(data.error || '메시지 저장에 실패했습니다.');
    }

    router.push(`/${data.id}`, { scroll: false });
    setCurrentId(data.id);
    return data.id;
  };

  const handleShare = async () => {
    setIsLoading(true);

    try {
      const newId = await saveMessageIfNeeded();
      if (!newId) return;

      navigator.clipboard.writeText(getAbsoluteUrl(`/${newId}`));
      posthog.capture('share_link_copied', {
        message_id: newId,
        image_type: imageType,
        sub_type: subType,
      });
      toast({
        title: "클립보드에 복사되었습니다!",
        description: "이 URL을 SNS에 공유해보세요.",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: error instanceof Error ? error.message : '오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageTypeChange = (value: string) => {
    if (!isCharacterId(value)) return;

    setImageType(value);
    resetShareId();
    setSubType(lastSubTypes[value]);
    setBackgroundId(lastBackgroundIds[value]);
    posthog.capture('character_selected', { character: value });
  };

  const handleSubTypeChange = (newSubType: string) => {
    setSubType(newSubType);
    setLastSubTypes(prev => ({
      ...prev,
      [imageType]: newSubType
    }));
    resetShareId();
    posthog.capture('expression_selected', { character: imageType, expression: newSubType });
  };

  const handleBackgroundChange = (newBackgroundId: string) => {
    setBackgroundId(newBackgroundId);
    setLastBackgroundIds(prev => ({
      ...prev,
      [imageType]: newBackgroundId
    }));
    resetShareId();
    posthog.capture('background_selected', { character: imageType, background_id: newBackgroundId });
  };

  const handleZoomModeChange = (checked: boolean) => {
    setZoomMode(checked);
    resetShareId();
  };

  const getAbsoluteUrl = (path: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${path}`;
  };

  const getShareUrlForId = (id: string) => {
    if (typeof window === 'undefined') return '';

    let host = window.location.origin;

    if (!host || host === 'about:blank' || host.includes('localhost')) {
      const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'talk.nene.dev';
      host = `https://${PRODUCTION_URL}`;
    }

    return `${host}/${id}`;
  };

  const handleShareButtonClick = async () => {
    setIsLoading(true);

    try {
      const newId = await saveMessageIfNeeded();
      if (!newId) return;

      const shareUrl = getShareUrlForId(newId);
      posthog.capture('share_twitter_clicked', {
        message_id: newId,
        image_type: imageType,
        sub_type: subType,
      });
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer',
      );
    } catch (error) {
      toast({
        title: "공유 실패",
        description: error instanceof Error ? error.message : '오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const throttledEditorImageUrl = useThrottle(editorImageUrl, 500);

  useEffect(() => {
    setIsPreviewLoading(true);
  }, [throttledEditorImageUrl]);

  const handleMessageChange = (value: string) => {
    setUserMessage(value);
    resetShareId();
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-[1400px] py-6 lg:py-8">
        <header className="mb-6 px-4 lg:mb-8 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight">말풍선 썸네일 생성기</h1>
          <p className="text-sm text-muted-foreground mt-1">
            블루 아카이브 스타일로 말풍선 썸네일을 만들어보세요. (나쁜말 금지!)
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[3fr_7fr] lg:items-stretch lg:gap-10">
          <div className="contents lg:block lg:h-full lg:pl-8">
            <div
              ref={previewSentinelRef}
              className="pointer-events-none h-px w-full px-4 lg:px-0"
              aria-hidden
            />
            <div
              className={cn(
                'sticky top-0 z-20 w-full space-y-4 rounded-md px-4 pt-4 pb-1 transition-[background-color,box-shadow] duration-200 lg:px-0 lg:pt-6',
                isPreviewStuck
                  ? 'bg-white pb-3 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.12),0_6px_12px_-2px_rgba(0,0,0,0.08)]'
                  : 'bg-transparent shadow-none',
              )}
            >
              <PreviewEditor
                imageUrl={throttledEditorImageUrl}
                value={userMessage}
                onChange={handleMessageChange}
                zoomMode={zoomMode}
                isLoading={isPreviewLoading}
                onImageLoad={() => setIsPreviewLoading(false)}
              />
              <div className="flex flex-row gap-2">
                <Button
                  className="flex-1"
                  onClick={handleShare}
                  disabled={isLoading}
                >
                  <Share2Icon className="mr-2 h-4 w-4" />
                  {isLoading ? "처리 중..." : "링크 복사하기"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={handleShareButtonClick}
                >
                  <TwitterLogoIcon className="mr-2 h-4 w-4" /> 트위터에 공유하기
                </Button>
              </div>
            </div>
          </div>

          <Card className="mx-4 sm:mx-6 lg:mx-8 lg:mr-8">
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="grid min-w-0 shrink gap-3">
                  <Label htmlFor="image-type">캐릭터</Label>
                  <RadioGroup
                    onValueChange={handleImageTypeChange}
                    className="flex flex-wrap gap-2"
                    value={imageType}
                  >
                    {CHARACTER_IDS.map((type) => (
                      <ImageRadioItem
                        key={type}
                        value={type}
                        subType={lastSubTypes[type]}
                      />
                    ))}
                  </RadioGroup>
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="zoom-mode"
                      checked={zoomMode}
                      onCheckedChange={handleZoomModeChange}
                    />
                    <Label htmlFor="zoom-mode" className="text-sm font-medium leading-none">
                      크기 확대
                    </Label>
                  </div>
                </div>

                <div className="min-w-0 flex-1 shrink-0 lg:min-w-[280px]">
                  <ExpressionPicker
                    key={imageType}
                    characterId={imageType}
                    value={subType}
                    onChange={handleSubTypeChange}
                  />
                </div>
              </div>

              <BackgroundPicker
                value={resolveBackgroundId(backgroundId, CHARACTERS[imageType].defaultBackgroundId)}
                onChange={handleBackgroundChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center items-center text-sm space-x-2 text-muted-foreground mt-6 px-4">
          <TwitterLogoIcon />
          &nbsp;or 𝕏 :
          <Link href="https://twitter.com/harunene">@harunene</Link>
        </div>
      </div>
    </div>
  );
}
