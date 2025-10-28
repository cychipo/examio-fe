import { ColorSchemeOption } from "@/components/atoms/k/ColorSchemeOption";

interface ColorSchemeSelectorProps {
  selectedMode: "light" | "dark" | "auto";
  onModeChange: (mode: "light" | "dark" | "auto") => void;
}

export function ColorSchemeSelector({
  selectedMode,
  onModeChange,
}: ColorSchemeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Color Scheme
      </label>
      <div className="grid grid-cols-3 gap-4">
        <ColorSchemeOption
          mode="light"
          isSelected={selectedMode === "light"}
          onClick={() => onModeChange("light")}
        />
        <ColorSchemeOption
          mode="dark"
          isSelected={selectedMode === "dark"}
          onClick={() => onModeChange("dark")}
        />
        <ColorSchemeOption
          mode="auto"
          isSelected={selectedMode === "auto"}
          onClick={() => onModeChange("auto")}
        />
      </div>
    </div>
  );
}
