import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/atoms/k/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
  color?: string;
}

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryItem({
  category,
  isActive,
  onClick,
}: CategoryItemProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer border-l-4 p-3 transition-all hover:shadow-md",
        isActive
          ? "border-l-primary bg-primary/5 dark:bg-primary/10"
          : "border-l-transparent hover:bg-muted"
      )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CategoryIcon icon={category.icon} />
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
        <Badge variant="secondary" className="h-6 min-w-6 rounded-full px-2">
          {category.count}
        </Badge>
      </div>
    </Card>
  );
}
