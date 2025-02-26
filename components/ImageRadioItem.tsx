import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ImageType } from "./Preview";


export default function ImageRadioItem({ 
  value, 
  currentValue, 
  onChange, 
}: { 
  value: ImageType; 
  currentValue: ImageType; 
  onChange: (value: ImageType) => void; 
}) {
  return (
    <div className="relative">
      <RadioGroupItem
        value={value}
        id={value}
        className="sr-only"
      />
      <Label
        htmlFor={value}
        className={`relative cursor-pointer rounded-md overflow-hidden block ${
          currentValue === value
            ? 'ring-4 ring-primary ring-offset-2'
            : 'hover:opacity-80'
        }`}
      >
        <Image src={`/images/${value}.jpg`} alt={value} width={50} height={50} className="object-cover" />
        {currentValue === value && (
          <div className="absolute top-1 right-1 rounded-full bg-primary w-4 h-4 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </Label>
    </div>
  );
};