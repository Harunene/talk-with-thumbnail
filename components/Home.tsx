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
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useThrottle } from '@/lib/useThrottle.js';

export default function Home() {
  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // 경로 매개변수에서 메시지 가져오기
  const pathMessage = params?.message ? decodeURIComponent(params.message as string) : '';
  // 쿼리 매개변수에서 메시지 가져오기 (이전 방식과의 호환성 유지)
  const queryMessage = searchParams.get('message') || '';
  
  // 경로 매개변수 우선, 없으면 쿼리 매개변수 사용
  const initialMessage = pathMessage || queryMessage;
  const [userMessage, setUserMessage] = useState(initialMessage);

  // 로컬 개발 환경에서는 localhost:3000 사용
  const VERCEL_URL = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? 'localhost:3000';
  const host = VERCEL_URL.startsWith('localhost') ? `http://${VERCEL_URL}` : `https://${VERCEL_URL}`;

  // 새로운 경로 기반 URL 생성
  const encodedMessage = encodeURIComponent(userMessage || '하고싶은 말');
  const pageUrl = `${host}/${encodedMessage}`;
  const ogImageUrl = `${host}/api/og/${encodedMessage}`;

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
                  <Image src={throttledImageUrl}
                    fill priority
                    alt="미리보기"
                    style={{ objectFit: "contain" }}
                    sizes="350px"
                    className="p-1" />
                </Card>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">하고싶은 말</Label>
                <Textarea 
                  id="message" 
                  placeholder="말풍선에 표시할 메시지를 입력하세요" 
                  value={userMessage} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserMessage(e.target.value)}
                  className="resize-none h-24"
                  maxLength={100}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(pageUrl);
                  toast({
                    title: "클립보드에 복사되었습니다!",
                    description: "이 URL을 SNS에 공유해보세요.",
                  });
                }}
              >
                <Share2Icon className="mr-2 h-4 w-4" /> 링크 복사하기
              </Button>
              <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full">
                  <TwitterLogoIcon className="mr-2 h-4 w-4" /> 트위터에 공유하기
                </Button>
              </Link>
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
