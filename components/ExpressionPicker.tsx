'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  CHARACTERS,
  formatExpression,
  getCharacterFacePath,
  getExpressionNumbers,
  type CharacterId,
} from '@/lib/characters';

interface ExpressionPickerProps {
  characterId: CharacterId;
  value: string;
  onChange: (expression: string) => void;
}

export default function ExpressionPicker({ characterId, value, onChange }: ExpressionPickerProps) {
  const expressions = getExpressionNumbers(characterId);
  const character = CHARACTERS[characterId];

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium leading-none">{character.name} 표정</span>
        <span className="text-xs text-muted-foreground">
          {Number.parseInt(value || character.defaultExpression, 10)} / {character.maxExpressions}
        </span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 max-h-56 overflow-y-auto rounded-md border p-2 bg-muted/20">
        {expressions.map((num) => {
          const expression = formatExpression(num);
          const isSelected = value === expression;

          return (
            <button
              key={expression}
              type="button"
              aria-label={`${character.name} 표정 ${num}`}
              aria-pressed={isSelected}
              onClick={() => onChange(expression)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors',
                isSelected
                  ? 'border-primary ring-2 ring-inset ring-primary/40 z-10'
                  : 'border-transparent hover:border-accent'
              )}
            >
              <Image
                src={getCharacterFacePath(characterId, expression)}
                alt={`${character.name} ${num}`}
                fill
                className="object-cover object-[center_15%] scale-110"
                sizes="64px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
