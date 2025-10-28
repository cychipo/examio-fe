"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExamRoomManagementTemplate } from "@/templates/ExamRoomManagementTemplate";
import type { ExamRoom } from "@/components/organisms/k/ExamRoomList";
import type { Participant } from "@/components/organisms/k/RecentParticipantsList";

// Mock data
const mockRooms: ExamRoom[] = [
  {
    id: "1",
    name: "Thi Toán học cuối kỳ",
    roomType: "Phòng riêng • Mã phòng: MTH-2024-01",
    duration: 120,
    participants: 45,
    timeInfo: "1h 15m",
    timeLabel: "Còn lại",
    status: "active",
    isPrivate: true,
  },
  {
    id: "2",
    name: "Kiểm tra Vật lý",
    roomType: "Phòng công khai • Mã phòng: PHY-2024-02",
    duration: 60,
    participants: 28,
    timeInfo: "30m",
    timeLabel: "Bắt đầu sau",
    status: "upcoming",
    isPrivate: false,
  },
  {
    id: "3",
    name: "Đánh giá Thí nghiệm Hóa học",
    roomType: "Phòng riêng • Mã phòng: CHE-2024-03",
    duration: 90,
    participants: 32,
    timeInfo: "2h 45m",
    timeLabel: "Còn lại",
    status: "active",
    isPrivate: true,
  },
];

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    examName: "Thi Toán học cuối kỳ",
    status: "online",
  },
  {
    id: "2",
    name: "Trần Thị B",
    examName: "Thí nghiệm Hóa học",
    status: "online",
  },
  {
    id: "3",
    name: "Lê Văn C",
    examName: "Kiểm tra Vật lý",
    status: "away",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    examName: "Thi Toán học cuối kỳ",
    status: "offline",
  },
];

export default function ManageExamRoomPage() {
  const router = useRouter();
  const [roomFilter, setRoomFilter] = useState("all");

  const stats = {
    activeRooms: 12,
    totalParticipants: 248,
    ongoingExams: 8,
    completedToday: 34,
  };

  const filteredRooms =
    roomFilter === "all"
      ? mockRooms
      : mockRooms.filter((room) => room.status === roomFilter);

  const handleViewRoom = (id: string) => {
    router.push(`/k/manage-exam-room/${id}`);
  };

  const handleViewAllParticipants = () => {
    console.log("View all participants");
  };

  return (
    <ExamRoomManagementTemplate
      stats={stats}
      rooms={filteredRooms}
      participants={mockParticipants}
      roomFilter={roomFilter}
      onRoomFilterChange={setRoomFilter}
      onViewRoom={handleViewRoom}
      onViewAllParticipants={handleViewAllParticipants}
    />
  );
}
