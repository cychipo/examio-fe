import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructionItemProps {
  text: string;
  type?: "check" | "warning";
}

export function InstructionItem({
  text,
  type = "check",
}: InstructionItemProps) {
  const Icon = type === "check" ? CheckCircle2 : AlertTriangle;
  const iconColor = type === "check" ? "text-green-500" : "text-orange-500";

  return (
    <div className="flex items-start gap-2">
      <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", iconColor)} />
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}
