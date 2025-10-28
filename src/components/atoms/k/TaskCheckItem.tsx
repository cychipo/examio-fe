import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskCheckItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function TaskCheckItem({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: TaskCheckItemProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={id}
        className={cn(
          "flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          checked && "text-muted-foreground line-through"
        )}>
        {label}
      </label>
    </div>
  );
}
