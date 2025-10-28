import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface InterfaceSettings {
  compactMode: boolean;
  animations: boolean;
  language: string;
  fontSize: number;
}

interface InterfaceSettingsSectionProps {
  settings: InterfaceSettings;
  onSettingChange: <K extends keyof InterfaceSettings>(
    key: K,
    value: InterfaceSettings[K]
  ) => void;
}

export function InterfaceSettingsSection({
  settings,
  onSettingChange,
}: InterfaceSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Cài đặt giao diện
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Điều chỉnh cách hiển thị và tương tác với ứng dụng
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Compact Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compact-mode" className="text-base font-medium">
              Chế độ gọn
            </Label>
            <p className="text-sm text-muted-foreground">
              Giảm khoảng cách giữa các phần tử
            </p>
          </div>
          <Switch
            id="compact-mode"
            checked={settings.compactMode}
            onCheckedChange={(checked) =>
              onSettingChange("compactMode", checked)
            }
          />
        </div>

        {/* Animations */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations" className="text-base font-medium">
              Hiệu ứng chuyển động
            </Label>
            <p className="text-sm text-muted-foreground">
              Bật/tắt hiệu ứng animation
            </p>
          </div>
          <Switch
            id="animations"
            checked={settings.animations}
            onCheckedChange={(checked) =>
              onSettingChange("animations", checked)
            }
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-base font-medium">
            Ngôn ngữ
          </Label>
          <Select
            value={settings.language}
            onValueChange={(value) => onSettingChange("language", value)}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Chọn ngôn ngữ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size" className="text-base font-medium">
              Kích thước chữ
            </Label>
            <span className="text-sm text-muted-foreground">
              {settings.fontSize}px
            </span>
          </div>
          <Slider
            id="font-size"
            min={12}
            max={20}
            step={1}
            value={[settings.fontSize]}
            onValueChange={(value) => onSettingChange("fontSize", value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Nhỏ</span>
            <span>Lớn</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
