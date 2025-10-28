import { CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/atoms/k/UserAvatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, Info } from "lucide-react";

interface ChatHeaderProps {
  userName: string;
  userStatus: string;
  userAvatar?: string;
  isOnline: boolean;
  onShowInfo: () => void;
}

export function ChatHeader({
  userName,
  userStatus,
  userAvatar,
  isOnline,
  onShowInfo,
}: ChatHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={userAvatar}
          alt={userName}
          fallback={userName.slice(0, 2).toUpperCase()}
          online={isOnline}
          size="md"
        />
        <div>
          <h2 className="text-lg font-semibold text-foreground">{userName}</h2>
          <p className="text-sm text-muted-foreground">{userStatus}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onShowInfo}>
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </CardHeader>
  );
}
