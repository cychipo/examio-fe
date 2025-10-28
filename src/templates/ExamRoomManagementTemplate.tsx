import { RoomStatsSection } from "@/components/organisms/k/RoomStatsSection";
import {
  ExamRoomList,
  type ExamRoom,
} from "@/components/organisms/k/ExamRoomList";
import {
  RecentParticipantsList,
  type Participant,
} from "@/components/organisms/k/RecentParticipantsList";

interface RoomStats {
  activeRooms: number;
  totalParticipants: number;
  ongoingExams: number;
  completedToday: number;
}

interface ExamRoomManagementTemplateProps {
  stats: RoomStats;
  rooms: ExamRoom[];
  participants: Participant[];
  roomFilter: string;
  onRoomFilterChange: (value: string) => void;
  onViewRoom: (id: string) => void;
  onViewAllParticipants?: () => void;
}

export function ExamRoomManagementTemplate({
  stats,
  rooms,
  participants,
  roomFilter,
  onRoomFilterChange,
  onViewRoom,
  onViewAllParticipants,
}: ExamRoomManagementTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="mb-8">
          <RoomStatsSection stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Exam Rooms - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ExamRoomList
              rooms={rooms}
              filter={roomFilter}
              onFilterChange={onRoomFilterChange}
              onViewRoom={onViewRoom}
            />
          </div>

          {/* Recent Participants - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentParticipantsList
              participants={participants}
              onViewAll={onViewAllParticipants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
