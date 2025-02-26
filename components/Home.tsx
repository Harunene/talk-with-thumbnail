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
import { ImageType } from "@/components/Preview";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import ImageRadioItem from "@/components/ImageRadioItem";

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
        })
        .catch(err => {
          console.error('메시지 조회 실패:', err);
          setUserMessage('');
        });
    }
  }, [messageId, params, searchParams]);

  // 미리보기 이미지 URL - 실시간 변경을 위해 메시지 직접 사용
  const encodedMessage = encodeURIComponent(userMessage || '');
  // 메시지가 비어있으면 기본 경로 사용
  const ogImageUrl = userMessage.trim() 
    ? `/api/og/${encodedMessage}?type=${imageType}` 
    : `/api/og/?type=${imageType}`;

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
            imageType: imageType 
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
    setImageType(value as ImageType);
    if (currentId) setCurrentId('');
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
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
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
                간단하게 말풍선 썸네일을 만들어보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2 relative aspect-[600/315]">
                <Card className="overflow-hidden">
                  <Image 
                    src={throttledImageUrl}
                    fill 
                    priority
                    unoptimized={true}
                    alt="미리보기"
                    style={{ objectFit: "contain" }}
                    sizes="350px"
                    className="p-1" 
                  />
                </Card>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-type">말풍선 이미지</Label>
                <RadioGroup
                  onValueChange={handleImageTypeChange}
                  defaultValue={imageType}
                  className="flex gap-4"
                  value={imageType}
                >
                  <ImageRadioItem
                    value="sana_stare"
                    currentValue={imageType}
                    onChange={handleImageTypeChange}
                    imagePath="/images/sana_stare.jpg"
                    alt="기본 (흰색)"
                  />
                  
                  <ImageRadioItem
                    value="sana_dizzy"
                    currentValue={imageType}
                    onChange={handleImageTypeChange}
                    imagePath="/images/sana_dizzy.jpg"
                    alt="눈빛"
                  />
                  
                  <ImageRadioItem
                    value="cat_lick"
                    currentValue={imageType}
                    onChange={handleImageTypeChange}
                    imagePath="/images/cat_lick.jpg"
                    alt="고양이"
                  />
                </RadioGroup>
              </div>

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
                  maxLength={100}
                />
                <div className="text-right text-sm text-muted-foreground">
                  {userMessage.length}/100
                </div>
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
