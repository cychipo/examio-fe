import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SettingsSidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SettingsSidebarItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 px-4 py-2.5 text-left font-normal",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Button>
  );
}
