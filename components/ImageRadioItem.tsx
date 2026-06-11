import { RadioGroupItem } from "@/components/ui/radio-group";
import { CHARACTERS, getCharacterFacePath, type CharacterId } from "@/lib/characters";
import Image from "next/image";

interface ImageRadioItemProps {
  value: CharacterId;
  subType?: string;
}

export default function ImageRadioItem({ value, subType = '001' }: ImageRadioItemProps) {
  const character = CHARACTERS[value];
  const imagePath = getCharacterFacePath(value, subType);

  return (
    <div className="relative min-w-0 shrink">
      <RadioGroupItem
        value={value}
        id={value}
        className="peer sr-only"
        aria-label={character.name}
      />
      <label
        htmlFor={value}
        className="flex flex-col items-center gap-1 rounded-md border-2 border-muted bg-popover px-2 py-1.5 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([aria-checked=true])]:border-primary"
      >
        <div className="relative h-12 w-12">
          <Image
            src={imagePath}
            alt={character.name}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
        <span className="text-[10px] text-muted-foreground leading-none">{character.name}</span>
      </label>
    </div>
  );
}
