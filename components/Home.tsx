"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Share2Icon, TwitterLogoIcon } from '@radix-ui/react-icons';
import Image from "next/image";
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useThrottle } from '@/lib/useThrottle.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImageType } from "@/components/Preview";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import ImageRadioItem from "@/components/ImageRadioItem";
import { Slider } from "@/components/ui/slider";

// ImageType의 모든 가능한 값을 배열로 정의
const IMAGE_TYPES: ImageType[] = [
  'sana_stare',
  'sana_dizzy',
  'cat_lick',
  'cat_scared',
  'ichihime',
  'sans',
  'hikari',
  'nozomi'
];

// 블루 아카이브 캐릭터 정보
const BLUE_ARCHIVE_CHARACTERS = {
  hikari: {
    name: '히카리',
    maxSubTypes: 18,
    lastSubType: '001'
  },
  nozomi: {
    name: '노조미',
    maxSubTypes: 21,
    lastSubType: '001'
  }
};

// 블루 아카이브 캐릭터인지 확인하는 함수
const isBlueArchiveCharacter = (type: ImageType): boolean => {
  return type === 'hikari' || type === 'nozomi';
};

interface HomeProps {
  messageId?: string;
}

export default function Home({ messageId = '' }: HomeProps) {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentId, setCurrentId] = useState(messageId);
  const [imageType, setImageType] = useState<ImageType>('sana_stare');
  const [subType, setSubType] = useState<string>('');
  const [lastSubTypes, setLastSubTypes] = useState<Record<ImageType, string>>(() => {
    // 초기값으로 각 캐릭터의 기본 subType을 설정
    return Object.fromEntries(
      IMAGE_TYPES.map(type => [
        type,
        isBlueArchiveCharacter(type) 
          ? BLUE_ARCHIVE_CHARACTERS[type as 'hikari' | 'nozomi'].lastSubType 
          : ''
      ])
    ) as Record<ImageType, string>;
  });
  
  // 경로 매개변수나 쿼리 매개변수에서 메시지 가져오기
  useEffect(() => {
    if (messageId) {
      fetch(`/api/message/${messageId}`)
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            setUserMessage(data.message);
          }
          if (data.imageType) {
            setImageType(data.imageType as ImageType);
          }
          if (data.subType) {
            setSubType(data.subType);
            // lastSubTypes도 업데이트
            setLastSubTypes(prev => ({
              ...prev,
              [data.imageType]: data.subType
            }));
          }
        })
        .catch(err => {
          console.error('메시지 조회 실패:', err);
          setUserMessage('');
        });
    }
  }, [messageId]);

  // 미리보기 이미지 URL - 실시간 변경을 위해 메시지 직접 사용
  const encodedMessage = encodeURIComponent(userMessage || '');
  // 메시지가 비어있으면 기본 경로 사용
  const ogImageUrl = userMessage.trim() 
    ? `/api/og/${encodedMessage}?type=${imageType}&subType=${subType}` 
    : `/api/og/?type=${imageType}&subType=${subType}`;

  // 공유 처리 함수
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
      // ID가 없으면 새로 저장 (메시지 변경 시 ID가 이미 초기화됨)
      let newId = currentId;
      if (!currentId) {
        const response = await fetch('/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage,
            imageType: imageType,
            subType: subType // 모든 이미지 타입에 대해 subType 전송
          }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.id) {
          newId = data.id;
        } else {
          throw new Error(data.error || '메시지 저장에 실패했습니다.');
        }
      }
      
      // 공유용 URL 복사
      const shareUrl = `/${newId}`;
      navigator.clipboard.writeText(getAbsoluteUrl(shareUrl));
      toast({
        title: "클립보드에 복사되었습니다!",
        description: "이 URL을 SNS에 공유해보세요.",
      });
      router.push(`/${newId}`, { scroll: false, shallow: true });

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

  // 스타일 변경 시 ID 초기화 (새로운 해시가 생성되도록)
  const handleImageTypeChange = (value: string) => {
    const newType = value as ImageType;
    setImageType(newType);
    if (currentId) setCurrentId('');
    
    // 이전에 선택했던 subType으로 복원
    setSubType(lastSubTypes[newType]);
  };
  
  // subType 변경 시 ID 초기화
  const handleSubTypeChange = (value: number[]) => {
    const newSubType = value[0].toString().padStart(3, '0');
    setSubType(newSubType);
    // 현재 이미지 타입의 마지막 선택을 저장
    setLastSubTypes(prev => ({
      ...prev,
      [imageType]: newSubType
    }));
    if (currentId) setCurrentId('');
  };

  // 현재 선택된 캐릭터의 최대 subType 가져오기
  const getMaxSubTypes = (): number => {
    if (isBlueArchiveCharacter(imageType)) {
      return BLUE_ARCHIVE_CHARACTERS[imageType as 'hikari' | 'nozomi'].maxSubTypes;
    }
    return 1;
  };

  // subType을 숫자로 변환
  const getSubTypeNumber = (): number => {
    return Number.parseInt(subType, 10);
  };

  // 공유용 URL은 절대 URL 필요
  const getAbsoluteUrl = (path: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${path}`;
  };

  const getCurrentUrl = () => {
    if (typeof window === 'undefined' || !currentId) return ''
    
    // 호스트 가져오기 (클라이언트 사이드)
    let host = window.location.origin
    
    // 호스트가 비어있거나 localhost인 경우 프로덕션 도메인 사용
    if (!host || host === 'about:blank' || host.includes('localhost')) {
      const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'talk.nene.dev'
      host = `https://${PRODUCTION_URL}`
    }
    
    return `${host}/${currentId}`
  }

  // 트위터 공유 URL
  const getTwitterShareUrl = () => {
    const currentUrl = getCurrentUrl()
    if (!currentUrl) return ''
    
    const url = encodeURIComponent(currentUrl)
    return `https://twitter.com/intent/tweet?url=${url}`
  }
  
  // 네이티브 공유 기능 사용
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
    
    // Web Share API 지원 확인
    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl
        });
        // 성공적으로 공유되면 토스트 메시지 표시
        toast({
          title: "공유되었습니다!",
        });
        return;
      } catch (error) {
        // 사용자가 공유를 취소하거나 오류가 발생한 경우
        console.error('공유 실패:', error);
        // 기본 방식으로 폴백
      }
    }
    
    // Web Share API를 지원하지 않거나 실패한 경우 기본 방식으로 새 창에서 열기
    window.open(getTwitterShareUrl(), '_blank', 'noopener,noreferrer');
  };

  const throttledImageUrl = useThrottle(ogImageUrl, 500);

  return (
    <>
      <div className="flex h-screen">
        <div className="w-[450px] m-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">말풍선 썸네일 생성기</CardTitle>
              <CardDescription>
                간단하게 말풍선 썸네일을 만들어보세요. (나쁜말 금지!)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid relative aspect-[600/315]">
                <Card className="overflow-hidden border">
                  <div className="relative w-full h-full rounded-md overflow-hidden">
                    <Image 
                      src={throttledImageUrl}
                      fill 
                      priority
                      unoptimized={true}
                      alt="미리보기"
                      sizes="350px"
                    />
                  </div>
                </Card>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-type">캐릭터 이미지</Label>
                <RadioGroup
                  onValueChange={handleImageTypeChange}
                  defaultValue={imageType}
                  className="grid grid-cols-4 gap-4"
                  value={imageType}
                >
                  {IMAGE_TYPES.map((type) => (
                    <ImageRadioItem
                      key={type}
                      value={type}
                      currentValue={imageType}
                      onChange={handleImageTypeChange}
                      subType={lastSubTypes[type]}
                    />
                  ))}
                </RadioGroup>
              </div>
              
              {/* 블루 아카이브 캐릭터 선택 시 subType 선택 UI 표시 */}
              {isBlueArchiveCharacter(imageType) && (
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sub-type">캐릭터 표정 선택</Label>
                    <span className="text-sm text-muted-foreground">
                      {getSubTypeNumber()} / {getMaxSubTypes()}
                    </span>
                  </div>
                  <Slider
                    id="sub-type"
                    min={1}
                    max={getMaxSubTypes()}
                    step={1}
                    value={[getSubTypeNumber()]}
                    onValueChange={handleSubTypeChange}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {BLUE_ARCHIVE_CHARACTERS[imageType as 'hikari' | 'nozomi'].name}의 다양한 표정을 선택해보세요.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="message">하고싶은 말</Label>
                <Textarea 
                  id="message" 
                  placeholder="말풍선에 표시할 메시지를 입력하세요" 
                  value={userMessage} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setUserMessage(e.target.value);
                    // 메시지가 변경되면 ID 초기화
                    if (currentId) setCurrentId('');
                  }}
                  className="resize-none h-24"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleShare}
                disabled={isLoading}
              >
                <Share2Icon className="mr-2 h-4 w-4" /> 
                {isLoading ? "처리 중..." : "링크 복사하기"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={isLoading || !currentId}
                onClick={handleShareButtonClick}
              >
                <TwitterLogoIcon className="mr-2 h-4 w-4" /> 트위터에 공유하기
              </Button>
            </CardFooter>
          </Card>

          <div className="flex justify-center items-center text-sm space-x-2 text-muted-foreground h-10">
            <TwitterLogoIcon />
            &nbsp;or 𝕏 :
            <Link href="https://twitter.com/harunene">@harunene</Link>
          </div>
        </div>
      </div>
    </>
  );
}
