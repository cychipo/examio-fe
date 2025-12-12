import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  sizeLogo?: number;
  sizeText?: number;
}

export default function Logo({ className, sizeLogo, sizeText }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image
        src="/favicon.svg"
        alt="Logo"
        width={sizeLogo ?? 32}
        height={sizeLogo ?? 32}
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white">
        <p className={cn(sizeText ? `text-[${sizeText}px]` : "text-2xl")}>
          FayEdu
        </p>
      </motion.span>
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
    <div className={cn("flex items-center space-x-2", className)}>
      <Image src="/favicon.svg" alt="Logo" width={sizeIcon} height={sizeIcon} />
    </div>
  );
}
