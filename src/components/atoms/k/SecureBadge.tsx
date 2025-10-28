import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecureBadge() {
  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
      <Shield className="h-3 w-3" />
      Phiên bảo mật
    </Badge>
  );
}
