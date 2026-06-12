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

const EXPRESSION_ICON_SIZE = 56;

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
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm font-medium leading-none">표정</span>
        <span className="text-xs text-muted-foreground shrink-0">
          {Number.parseInt(value || character.defaultExpression, 10)} / {character.maxExpressions}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 rounded-md border p-2 bg-muted/20">
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
                'relative shrink-0 overflow-hidden rounded-lg bg-muted transition-colors',
                isSelected
                  ? 'border-2 border-primary ring-2 ring-inset ring-primary/40'
                  : 'border border-border/70 hover:opacity-80',
              )}
              style={{ width: EXPRESSION_ICON_SIZE, height: EXPRESSION_ICON_SIZE }}
            >
              <Image
                key={`${characterId}-${expression}`}
                src={getCharacterFacePath(characterId, expression)}
                alt={`${character.name} ${num}`}
                width={EXPRESSION_ICON_SIZE}
                height={EXPRESSION_ICON_SIZE}
                unoptimized
                className="h-full w-full object-cover object-center"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
