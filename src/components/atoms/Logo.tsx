import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "motion/react";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image src="/favicon.svg" alt="Logo" width={32} height={32} />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        <p className="text-2xl">Examio</p>
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
