import {
  SettingsSidebar,
  type SettingsSection,
} from "@/components/organisms/k/SettingsSidebar";
import { ThemeSettingsSection } from "@/components/organisms/k/ThemeSettingsSection";
import { InterfaceSettingsSection } from "@/components/organisms/k/InterfaceSettingsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InterfaceSettings {
  compactMode: boolean;
  animations: boolean;
  language: string;
  fontSize: number;
}

interface SettingsTemplateProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  colorScheme: "light" | "dark" | "auto";
  accentColor: string;
  onColorSchemeChange: (scheme: "light" | "dark" | "auto") => void;
  onAccentColorChange: (color: string) => void;
  interfaceSettings: InterfaceSettings;
  onInterfaceSettingChange: <K extends keyof InterfaceSettings>(
    key: K,
    value: InterfaceSettings[K]
  ) => void;
  onSaveTheme: () => void;
  onCancelTheme: () => void;
  hasThemeChanges: boolean;
}

export function SettingsTemplate({
  activeSection,
  onSectionChange,
  colorScheme,
  accentColor,
  onColorSchemeChange,
  onAccentColorChange,
  interfaceSettings,
  onInterfaceSettingChange,
  onSaveTheme,
  onCancelTheme,
  hasThemeChanges,
}: SettingsTemplateProps) {
  const renderContent = () => {
    switch (activeSection) {
      case "theme":
        return (
          <ThemeSettingsSection
            colorScheme={colorScheme}
            accentColor={accentColor}
            onColorSchemeChange={onColorSchemeChange}
            onAccentColorChange={onAccentColorChange}
            onSave={onSaveTheme}
            onCancel={onCancelTheme}
            hasChanges={hasThemeChanges}
          />
        );

      case "interface":
        return (
          <InterfaceSettingsSection
            settings={interfaceSettings}
            onSettingChange={onInterfaceSettingChange}
          />
        );

      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Cài đặt thông báo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý tùy chọn nhận thông báo
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </CardContent>
          </Card>
        );

      case "privacy":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Bảo mật & Quyền riêng tư
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý bảo mật và quyền riêng tư của bạn
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </CardContent>
          </Card>
        );

      case "account":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Cài đặt tài khoản
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý thông tin tài khoản của bạn
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </CardContent>
          </Card>
        );

      case "integrations":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Tích hợp
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kết nối với các dịch vụ bên thứ ba
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </CardContent>
          </Card>
        );

      case "billing":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Thanh toán
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý phương thức thanh toán và hóa đơn
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng đang được phát triển...
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tùy chọn ứng dụng và tài khoản của bạn
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </aside>

        {/* Mobile Sidebar - Visible on mobile, hidden on lg+ */}
        <div className="lg:hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </div>

        {/* Content */}
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}
