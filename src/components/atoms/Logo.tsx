import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Image src="/examio.svg" alt="Logo" width={48} height={48} />
      <p className="text-2xl mt-3 -ml-2">Examio</p>
    </div>
  );
}
