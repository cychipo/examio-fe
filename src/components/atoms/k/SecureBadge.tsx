import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecureBadge() {
  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
      <div className="flex items-center gap-1">
        <Shield className="h-4 w-4" />
        <span>Phiên bảo mật</span>
      </div>
    </Badge>
  );
}
