"use client";
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
import {
  CHARACTER_IDS,
  CHARACTERS,
  isCharacterId,
  type CharacterId,
} from "@/lib/characters";
import { resolveBackgroundId } from "@/lib/backgrounds";
import { cn } from "@/lib/utils";
import { useThrottle } from '@/lib/useThrottle.js';
import { Share2Icon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { RadioGroup } from "@radix-ui/react-radio-group";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface HomeProps {
  messageId?: string;
}

export default function Home({ messageId = '' }: HomeProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentId, setCurrentId] = useState(messageId);
  const [imageType, setImageType] = useState<CharacterId>('hikari');
  const [subType, setSubType] = useState(CHARACTERS.hikari.defaultExpression);
  const [backgroundId, setBackgroundId] = useState(CHARACTERS.hikari.defaultBackgroundId);
  const [lastSubTypes, setLastSubTypes] = useState<Record<CharacterId, string>>(() =>
    Object.fromEntries(
      CHARACTER_IDS.map((id) => [id, CHARACTERS[id].defaultExpression])
    ) as Record<CharacterId, string>
  );
  const [lastBackgroundIds, setLastBackgroundIds] = useState<Record<CharacterId, string>>(() =>
    Object.fromEntries(
      CHARACTER_IDS.map((id) => [id, CHARACTERS[id].defaultBackgroundId])
    ) as Record<CharacterId, string>
  );
  const [zoomMode, setZoomMode] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isPreviewStuck, setIsPreviewStuck] = useState(false);
  const previewSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageId) return;

    fetch(`/api/message/${messageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setUserMessage(data.message);
        }
        if (data.imageType && isCharacterId(data.imageType)) {
          setImageType(data.imageType);
        }
        if (data.subType) {
          setSubType(data.subType);
          if (isCharacterId(data.imageType)) {
            setLastSubTypes(prev => ({
              ...prev,
              [data.imageType]: data.subType
            }));
          }
        }
        if (data.backgroundId) {
          setBackgroundId(data.backgroundId);
          if (isCharacterId(data.imageType)) {
            setLastBackgroundIds(prev => ({
              ...prev,
              [data.imageType]: data.backgroundId
            }));
          }
        }
        if (data.zoomMode !== undefined) {
          setZoomMode(data.zoomMode);
        }
      })
      .catch(err => {
        console.error('메시지 조회 실패:', err);
        setUserMessage('');
        setZoomMode(false);
      });
  }, [messageId]);

  useEffect(() => {
    const sentinel = previewSentinelRef.current;
    if (!sentinel) return;

    const getRootMargin = () => {
      const topOffset = window.matchMedia('(min-width: 1024px)').matches ? 24 : 16;
      return `-${topOffset}px 0px 0px 0px`;
    };

    let observer = new IntersectionObserver(
      ([entry]) => setIsPreviewStuck(!entry.isIntersecting),
      { threshold: [0], rootMargin: getRootMargin() },
    );
    observer.observe(sentinel);

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleViewportChange = () => {
      observer.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => setIsPreviewStuck(!entry.isIntersecting),
        { threshold: [0], rootMargin: getRootMargin() },
      );
      observer.observe(sentinel);
    };
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
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

  const handleShare = async () => {
    if (!userMessage.trim()) {
      toast({
        title: "메시지를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let newId = currentId;
      if (!currentId) {
        const response = await fetch('/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

        if (response.ok && data.id) {
          newId = data.id;
        } else {
          throw new Error(data.error || '메시지 저장에 실패했습니다.');
        }
      }

      const shareUrl = `/${newId}`;
      navigator.clipboard.writeText(getAbsoluteUrl(shareUrl));
      toast({
        title: "클립보드에 복사되었습니다!",
        description: "이 URL을 SNS에 공유해보세요.",
      });
      router.push(`/${newId}`, { scroll: false });
      setCurrentId(newId);
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
  };

  const handleSubTypeChange = (newSubType: string) => {
    setSubType(newSubType);
    setLastSubTypes(prev => ({
      ...prev,
      [imageType]: newSubType
    }));
    resetShareId();
  };

  const handleBackgroundChange = (newBackgroundId: string) => {
    setBackgroundId(newBackgroundId);
    setLastBackgroundIds(prev => ({
      ...prev,
      [imageType]: newBackgroundId
    }));
    resetShareId();
  };

  const handleZoomModeChange = (checked: boolean) => {
    setZoomMode(checked);
    resetShareId();
  };

  const getAbsoluteUrl = (path: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${path}`;
  };

  const getCurrentUrl = () => {
    if (typeof window === 'undefined' || !currentId) return ''

    let host = window.location.origin

    if (!host || host === 'about:blank' || host.includes('localhost')) {
      const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'talk.nene.dev'
      host = `https://${PRODUCTION_URL}`
    }

    return `${host}/${currentId}`
  }

  const getTwitterShareUrl = () => {
    const currentUrl = getCurrentUrl()
    if (!currentUrl) return ''

    const url = encodeURIComponent(currentUrl)
    return `https://twitter.com/intent/tweet?url=${url}`
  }

  const handleShareButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const shareUrl = getCurrentUrl();
    if (!shareUrl) {
      toast({
        title: "공유할 URL이 없습니다",
        description: "먼저 메시지를 저장해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        toast({ title: "공유되었습니다!" });
        return;
      } catch (error) {
        console.error('공유 실패:', error);
      }
    }

    window.open(getTwitterShareUrl(), '_blank', 'noopener,noreferrer');
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
                'sticky top-4 z-20 w-full space-y-4 rounded-md px-4 py-1 transition-[background-color,box-shadow] duration-200 lg:top-6 lg:px-0',
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
                  disabled={isLoading || !currentId}
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
