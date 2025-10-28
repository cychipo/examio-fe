import { Card } from "@/components/ui/card";
import { SettingsSidebarItem } from "@/components/molecules/SettingsSidebarItem";
import {
  Palette,
  Monitor,
  Bell,
  Lock,
  User,
  Layers,
  CreditCard,
} from "lucide-react";

export type SettingsSection =
  | "theme"
  | "interface"
  | "notifications"
  | "privacy"
  | "account"
  | "integrations"
  | "billing";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <Card className="p-4">
      <div className="space-y-1">
        <p className="px-4 pb-2 text-xs font-semibold uppercase text-muted-foreground">
          Cài đặt
        </p>

        <SettingsSidebarItem
          icon={Palette}
          label="Chủ đề"
          isActive={activeSection === "theme"}
          onClick={() => onSectionChange("theme")}
        />

        <SettingsSidebarItem
          icon={Monitor}
          label="Giao diện"
          isActive={activeSection === "interface"}
          onClick={() => onSectionChange("interface")}
        />

        <SettingsSidebarItem
          icon={Bell}
          label="Thông báo"
          isActive={activeSection === "notifications"}
          onClick={() => onSectionChange("notifications")}
        />

        <SettingsSidebarItem
          icon={Lock}
          label="Bảo mật & Quyền riêng tư"
          isActive={activeSection === "privacy"}
          onClick={() => onSectionChange("privacy")}
        />

        <SettingsSidebarItem
          icon={User}
          label="Tài khoản"
          isActive={activeSection === "account"}
          onClick={() => onSectionChange("account")}
        />

        <SettingsSidebarItem
          icon={Layers}
          label="Tích hợp"
          isActive={activeSection === "integrations"}
          onClick={() => onSectionChange("integrations")}
        />

        <SettingsSidebarItem
          icon={CreditCard}
          label="Thanh toán"
          isActive={activeSection === "billing"}
          onClick={() => onSectionChange("billing")}
        />
      </div>
    </Card>
  );
}
