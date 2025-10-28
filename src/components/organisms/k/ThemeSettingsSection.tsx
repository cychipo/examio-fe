import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorSchemeSelector } from "@/components/molecules/ColorSchemeSelector";
import { AccentColorPicker } from "@/components/molecules/AccentColorPicker";
import { Button } from "@/components/ui/button";

interface ThemeSettingsSectionProps {
  colorScheme: "light" | "dark" | "auto";
  accentColor: string;
  onColorSchemeChange: (scheme: "light" | "dark" | "auto") => void;
  onAccentColorChange: (color: string) => void;
  onSave: () => void;
  onCancel: () => void;
  hasChanges: boolean;
}

export function ThemeSettingsSection({
  colorScheme,
  accentColor,
  onColorSchemeChange,
  onAccentColorChange,
  onSave,
  onCancel,
  hasChanges,
}: ThemeSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Cài đặt chủ đề
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Tùy chỉnh giao diện và màu sắc của ứng dụng
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <ColorSchemeSelector
          selectedMode={colorScheme}
          onModeChange={onColorSchemeChange}
        />

        <AccentColorPicker
          selectedColor={accentColor}
          onColorChange={onAccentColorChange}
        />

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button onClick={onSave}>Lưu thay đổi</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
