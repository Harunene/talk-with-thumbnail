"use client";
import BackgroundPicker from "@/components/BackgroundPicker";
import ExpressionPicker from "@/components/ExpressionPicker";
import ImageRadioItem from "@/components/ImageRadioItem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  CHARACTER_IDS,
  CHARACTERS,
  isCharacterId,
  type CharacterId,
} from "@/lib/characters";
import { resolveBackgroundId } from "@/lib/backgrounds";
import { useThrottle } from '@/lib/useThrottle.js';
import { Share2Icon, TwitterLogoIcon, ReloadIcon } from '@radix-ui/react-icons';
import { RadioGroup } from "@radix-ui/react-radio-group";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  const resetShareId = () => {
    if (currentId) setCurrentId('');
  };

  const encodedMessage = encodeURIComponent(userMessage || '');
  const ogImageParams = new URLSearchParams({
    type: imageType,
    subType,
    zoom: String(zoomMode),
    bg: resolveBackgroundId(backgroundId, CHARACTERS[imageType].defaultBackgroundId),
  });
  const ogImageUrl = userMessage.trim()
    ? `/api/og/${encodedMessage}?${ogImageParams.toString()}`
    : `/api/og/?${ogImageParams.toString()}`;

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

  const throttledImageUrl = useThrottle(ogImageUrl, 500);

  useEffect(() => {
    setIsPreviewLoading(true);
  }, [throttledImageUrl]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">말풍선 썸네일 생성기</h1>
          <p className="text-sm text-muted-foreground mt-1">
            블루 아카이브 스타일로 말풍선 썸네일을 만들어보세요. (나쁜말 금지!)
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[3fr_7fr] lg:items-start lg:gap-8">
          <Card className="lg:sticky lg:top-6 lg:self-start h-fit w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">미리보기</CardTitle>
              <CardDescription>공유 시 SNS에 표시되는 썸네일입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-[600/315] overflow-hidden rounded-lg border bg-black/5">
                <Image
                  src={throttledImageUrl}
                  fill
                  priority
                  unoptimized={true}
                  alt="미리보기"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  onLoadingComplete={() => setIsPreviewLoading(false)}
                  onError={() => setIsPreviewLoading(false)}
                />
                {isPreviewLoading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                    <ReloadIcon className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">하고싶은 말</Label>
                <Textarea
                  id="message"
                  placeholder="말풍선에 표시할 메시지를 입력하세요"
                  value={userMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setUserMessage(e.target.value);
                    resetShareId();
                  }}
                  className="resize-none min-h-24"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full sm:flex-1"
                onClick={handleShare}
                disabled={isLoading}
              >
                <Share2Icon className="mr-2 h-4 w-4" />
                {isLoading ? "처리 중..." : "링크 복사하기"}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:flex-1"
                disabled={isLoading || !currentId}
                onClick={handleShareButtonClick}
              >
                <TwitterLogoIcon className="mr-2 h-4 w-4" /> 트위터에 공유하기
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">설정</CardTitle>
              <CardDescription>캐릭터, 표정, 배경을 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
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
              </div>

              <ExpressionPicker
                characterId={imageType}
                value={subType}
                onChange={handleSubTypeChange}
              />

              <BackgroundPicker
                value={resolveBackgroundId(backgroundId, CHARACTERS[imageType].defaultBackgroundId)}
                onChange={handleBackgroundChange}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="zoom-mode"
                  checked={zoomMode}
                  onCheckedChange={handleZoomModeChange}
                />
                <Label htmlFor="zoom-mode" className="text-sm font-medium leading-none">
                  크기 확대
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center items-center text-sm space-x-2 text-muted-foreground mt-6">
          <TwitterLogoIcon />
          &nbsp;or 𝕏 :
          <Link href="https://twitter.com/harunene">@harunene</Link>
        </div>
      </div>
    </div>
  );
}
