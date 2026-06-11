'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BACKGROUNDS, getBackgroundPath } from '@/lib/backgrounds';

interface BackgroundPickerProps {
  value: string;
  onChange: (backgroundId: string) => void;
}

export default function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium leading-none">배경 선택</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-72 overflow-y-auto rounded-md border p-2 bg-muted/20">
        {BACKGROUNDS.map((background) => {
          const isSelected = value === background.id;

          return (
            <button
              key={background.id}
              type="button"
              aria-label={background.name}
              aria-pressed={isSelected}
              onClick={() => onChange(background.id)}
              className={cn(
                'group relative w-full aspect-[16/9] overflow-hidden rounded-lg border-2 bg-muted transition-colors',
                isSelected
                  ? 'border-primary ring-2 ring-inset ring-primary/40 z-10'
                  : 'border-transparent hover:border-accent'
              )}
            >
              <Image
                src={getBackgroundPath(background.id)}
                alt={background.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 45vw, 180px"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/65 px-2 py-1 text-[11px] text-white truncate">
                {background.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
