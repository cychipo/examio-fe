import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccentColorButtonProps {
  color: string;
  colorName: string;
  isSelected: boolean;
  onClick: () => void;
}

export function AccentColorButton({
  color,
  colorName,
  isSelected,
  onClick,
}: AccentColorButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "relative h-10 w-10 rounded-full p-0 ring-offset-background transition-all hover:scale-110",
        isSelected && "ring-2 ring-offset-2"
      )}
      style={{
        backgroundColor: color,
        ...(isSelected && { borderColor: color }),
      }}
      title={colorName}>
      {isSelected && <Check className="h-5 w-5 text-white drop-shadow-md" />}
    </Button>
  );
}
