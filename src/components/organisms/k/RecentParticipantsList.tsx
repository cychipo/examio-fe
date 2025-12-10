import { Card } from "@/components/ui/card";
import { ParticipantListItem } from "@/components/molecules/ParticipantListItem";
import { Button } from "@/components/ui/button";

export interface Participant {
  id: string;
  name: string;
  examName: string;
  status: "online" | "offline" | "away";
}

interface RecentParticipantsListProps {
  participants: Participant[];
  onViewAll?: () => void;
}

export function RecentParticipantsList({
  participants,
  onViewAll,
}: RecentParticipantsListProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Thí sinh gần đây
        </h2>
      </div>

      <div className="divide-y divide-border">
        {participants.map((participant) => (
          <ParticipantListItem
            key={participant.id}
            name={participant.name}
            subtitle={participant.examName}
            status={participant.status}
          />
        ))}
      </div>
    </Card>
  );
}
