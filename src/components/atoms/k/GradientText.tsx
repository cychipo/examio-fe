import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export function GradientText({
  children,
  className,
  from = "gradient-from",
  via = "gradient-via",
  to = "gradient-to",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        `from-${from}`,
        via && `via-${via}`,
        `to-${to}`,
        className,
      )}
    >
      {children}
    </span>
  );
}
