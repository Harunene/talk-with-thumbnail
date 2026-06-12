'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface PreviewEditorProps {
  imageUrl: string;
  value: string;
  onChange: (value: string) => void;
  zoomMode?: boolean;
  isLoading?: boolean;
  onImageLoad?: () => void;
  /** false면 OG 이미지만 표시 (그리드 비교용) */
  interactive?: boolean;
}

export default function PreviewEditor({
  imageUrl,
  value,
  onChange,
  zoomMode = false,
  isLoading = false,
  onImageLoad,
  interactive = true,
}: PreviewEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateFontSize = (width: number) => {
      const ratio = zoomMode ? 20 / 600 : 14 / 600;
      setFontSize(Math.max(zoomMode ? 12 : 10, width * ratio));
    };

    updateFontSize(element.clientWidth);

    const observer = new ResizeObserver(([entry]) => {
      updateFontSize(entry.contentRect.width);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [zoomMode]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[600/315] w-full overflow-hidden rounded-md"
    >
      <Image
        src={imageUrl}
        fill
        priority
        unoptimized
        alt="썸네일 미리보기"
        sizes="(max-width: 1024px) 100vw, 420px"
        className="pointer-events-none select-none object-cover"
        onLoadingComplete={onImageLoad}
        onError={onImageLoad}
      />

      {interactive ? (
        <textarea
          id="message"
          aria-label="하고싶은 말"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="말풍선에 표시할 메시지를 입력하세요"
          spellCheck={false}
          className="ph-include-capture absolute left-[10%] right-[10%] top-[78%] bottom-[5%] z-20 resize-none overflow-hidden border-0 bg-transparent p-0 text-white placeholder:text-white/45 focus:outline-none focus:ring-0"
          style={{
            fontFamily: '"Gyeonggi Medium", sans-serif',
            fontSize,
            lineHeight: 1.4,
            textShadow: '0 0 5px #1A2B5F',
          }}
        />
      ) : null}

      {(isLoading || !imageUrl) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
          <ReloadIcon className="h-6 w-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
