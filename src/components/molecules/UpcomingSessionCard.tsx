import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock } from "lucide-react";

export interface StudySession {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: number;
}

interface UpcomingSessionCardProps {
  session: StudySession;
  onJoin?: () => void;
}

export function UpcomingSessionCard({
  session,
  onJoin,
}: UpcomingSessionCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2">
          {session.title}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{session.date}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{session.time}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{session.participants} người tham gia</span>
          </div>
        </div>

        <Button onClick={onJoin} className="w-full" size="sm">
          Tham gia phòng
        </Button>
      </CardContent>
    </Card>
  );
}
