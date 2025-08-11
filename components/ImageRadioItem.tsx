import { RadioGroupItem } from "@/components/ui/radio-group";
import { ImageType } from "@/components/Preview";
import Image from "next/image";

interface ImageRadioItemProps {
  value: string;
  currentValue: string;
  onChange: (value: string) => void;
  subType?: string;
}

export default function ImageRadioItem({ value, currentValue, onChange, subType = '001' }: ImageRadioItemProps) {
  const isBlueArchive = value === 'hikari' || value === 'nozomi' || value === 'aris';
  const imagePath = isBlueArchive
    ? `/images/bluearchive/char_face/${value}/up_${value}_${subType}.png`
    : `/images/${value}.png`;

  return (
    <div className="relative">
      <RadioGroupItem
        value={value}
        id={value}
        className="peer sr-only"
        aria-label={value}
      />
      <label
        htmlFor={value}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([aria-checked=true])]:border-primary"
        style={{ padding: 4 }}
      >
        <div className="relative w-full aspect-square">
          <Image
            src={imagePath}
            alt={value}
            fill
            className="object-contain p-0.5"
            sizes="72px"
          />
        </div>
      </label>
    </div>
  );
}