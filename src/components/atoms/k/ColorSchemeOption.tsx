import { Card } from "@/components/ui/card";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorSchemeOptionProps {
  mode: "light" | "dark" | "auto";
  isSelected: boolean;
  onClick: () => void;
}

const modeConfig = {
  light: {
    label: "Light",
    icon: Sun,
    bgClass: "bg-background",
    iconClass: "text-foreground",
  },
  dark: {
    label: "Dark",
    icon: Moon,
    bgClass: "bg-slate-900",
    iconClass: "text-slate-100",
  },
  auto: {
    label: "Auto",
    icon: Monitor,
    bgClass: "bg-gradient-to-br from-background to-slate-200 dark:to-slate-800",
    iconClass: "text-foreground",
  },
};

export function ColorSchemeOption({
  mode,
  isSelected,
  onClick,
}: ColorSchemeOptionProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              {isSelected && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              {!isSelected && (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {config.label}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 flex h-16 items-center justify-center rounded-md border",
            config.bgClass
          )}>
          <Icon className={cn("h-6 w-6", config.iconClass)} />
        </div>
      </div>
    </Card>
  );
}
