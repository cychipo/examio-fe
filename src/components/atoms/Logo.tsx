import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  sizeLogo?: number;
  sizeText?: number;
  showText?: boolean;
}

export default function Logo({
  className,
  sizeLogo = 40,
  sizeText,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <img
        src="/Logo_KMA.png"
        alt="KMA Edu Logo"
        width={sizeLogo}
        height={sizeLogo}
        className="object-contain"
       />
      {showText && (
        <span className="font-bold whitespace-pre text-foreground">
          <p
            className={cn(
              sizeText ? `text-[${sizeText}px]` : "text-xl",
              "kma-gradient-text font-bold",
            )}
          >
            KMA Edu
          </p>
        </span>
      )}
    </div>
  );
}

export function LogoOnly({
  className,
  sizeIcon,
}: {
  className?: string;
  sizeIcon: number;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/Logo_KMA.png"
        alt="KMA Edu Logo"
        width={sizeIcon}
        height={sizeIcon}
        className="object-contain"
       />
    </div>
  );
}
