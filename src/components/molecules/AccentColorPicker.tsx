import { AccentColorButton } from "@/components/atoms/k/AccentColorButton";

interface AccentColor {
  name: string;
  value: string;
}

const accentColors: AccentColor[] = [
  { name: "Blue", value: "#6366f1" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#a855f7" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
];

interface AccentColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function AccentColorPicker({
  selectedColor,
  onColorChange,
}: AccentColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Accent Color
      </label>
      <div className="flex flex-wrap gap-3">
        {accentColors.map((color) => (
          <AccentColorButton
            key={color.value}
            color={color.value}
            colorName={color.name}
            isSelected={selectedColor === color.value}
            onClick={() => onColorChange(color.value)}
          />
        ))}
      </div>
    </div>
  );
}
