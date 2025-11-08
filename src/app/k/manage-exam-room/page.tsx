"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useExamRoomStore } from "@/stores/useExamRoomStore";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { ExamRoomModal } from "@/components/organisms/ExamRoomModal";
import { ExamRoomFormData } from "@/components/molecules/ExamRoomForm";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { RoomStatsSection } from "@/components/organisms/k/RoomStatsSection";
import {
  ExamRoomList,
  type ExamRoom as ExamRoomListType,
} from "@/components/organisms/k/ExamRoomList";
import {
  RecentParticipantsList,
  type Participant,
} from "@/components/organisms/k/RecentParticipantsList";
import { ASSESS_TYPE } from "@/types/examRoom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ManageExamRoomPage() {
  const router = useRouter();

  const {
    examRooms,
    loading,
    fetchExamRooms,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom,
  } = useExamRoomStore();

  const { fetchQuizSets, quizSetsK } = useQuizSetStore();

  // UI States
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<
    ExamRoomFormData | undefined
  >();

  /**
   * Load exam rooms - chỉ gọi 1 lần khi mount
   */
  useEffect(() => {
    fetchExamRooms({
      page: 1,
      limit: 9999,
    });
  }, [fetchExamRooms]);

  /**
   * Load quiz sets cho form dropdown - chỉ gọi 1 lần
   */
  useEffect(() => {
    fetchQuizSets({
      page: 1,
      limit: 9999,
    });
  }, [fetchQuizSets]);

  /**
   * Tính toán stats từ examRooms
   */
  const stats = useMemo(() => {
    const activeRooms = examRooms.filter(
      (room) => room.assessType === ASSESS_TYPE.PUBLIC
    ).length;

    const totalParticipants = examRooms.reduce(
      (sum, room) => sum + (room._count?.examSessions || 0),
      0
    );

    return {
      activeRooms,
      totalParticipants,
      ongoingExams: 0, // TODO: Implement khi có API
      completedToday: 0, // TODO: Implement khi có API
    };
  }, [examRooms]);

  /**
   * Transform examRooms sang format ExamRoomListType
   */
  const transformedRooms = useMemo<ExamRoomListType[]>(() => {
    return examRooms.map((room) => ({
      id: room.id,
      name: room.title,
      roomType: room.quizSet?.title || "N/A",
      duration: 60, // TODO: Get từ quizSet khi có
      participants: room._count?.examSessions || 0,
      timeInfo: new Date(room.createdAt).toLocaleDateString("vi-VN"),
      timeLabel: "Ngày tạo",
      status: "active" as const, // TODO: Tính status từ examSessions
      isPrivate: room.assessType === ASSESS_TYPE.PRIVATE,
    }));
  }, [examRooms]);

  /**
   * Filter rooms theo roomFilter
   */
  const filteredRooms = useMemo(() => {
    if (roomFilter === "all") return transformedRooms;
    return transformedRooms.filter((room) => room.status === roomFilter);
  }, [transformedRooms, roomFilter]);

  /**
   * Mock participants - TODO: Replace với API thực
   */
  const mockParticipants = useMemo<Participant[]>(() => {
    return [
      {
        id: "1",
        name: "Nguyễn Văn A",
        examName: "Đề thi Toán học",
        status: "online" as const,
      },
      {
        id: "2",
        name: "Trần Thị B",
        examName: "Đề thi Vật lý",
        status: "away" as const,
      },
      {
        id: "3",
        name: "Lê Văn C",
        examName: "Đề thi Hóa học",
        status: "offline" as const,
      },
    ];
  }, []);

  /**
   * Quiz set options cho form
   */
  const quizSetOptions = useMemo(
    () =>
      quizSetsK.map((qs) => ({
        id: qs.id,
        title: qs.title,
        questionCount: qs.questionCount,
      })),
    [quizSetsK]
  );

  // ==================== CRUD Handlers ====================

  const handleCreateRoom = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEditRoom = useCallback(
    (id: string) => {
      const room = examRooms.find((r) => r.id === id);
      if (room) {
        setEditFormData({
          title: room.title,
          description: room.description || "",
          quizSetId: room.quizSetId,
          assessType: room.assessType,
          allowRetake: room.allowRetake,
          maxAttempts: room.maxAttempts,
        });
        setSelectedRoomId(id);
        setIsEditModalOpen(true);
      }
    },
    [examRooms]
  );

  const handleDeleteRoom = useCallback((id: string) => {
    setSelectedRoomId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewRoom = useCallback(
    (id: string) => {
      router.push(`/k/manage-exam-room/${id}`);
    },
    [router]
  );

  /**
   * KHÔNG cần gọi fetchExamRooms sau create
   * Store đã tự động update qua createExamRoom action
   */
  const handleCreateSubmit = useCallback(
    async (data: ExamRoomFormData) => {
      try {
        await createExamRoom({
          title: data.title,
          description: data.description,
          quizSetId: data.quizSetId,
          assessType: data.assessType,
          allowRetake: data.allowRetake,
          maxAttempts: data.maxAttempts,
        });
        setIsCreateModalOpen(false);
        // Store đã update, không cần refetch
      } catch (error) {
        console.error("Create exam room error:", error);
      }
    },
    [createExamRoom]
  );

  /**
   * KHÔNG cần gọi fetchExamRooms sau update
   * Store đã tự động update qua updateExamRoom action
   */
  const handleEditSubmit = useCallback(
    async (data: ExamRoomFormData) => {
      if (selectedRoomId) {
        try {
          await updateExamRoom(selectedRoomId, {
            title: data.title,
            description: data.description,
            quizSetId: data.quizSetId,
            assessType: data.assessType,
            allowRetake: data.allowRetake,
            maxAttempts: data.maxAttempts,
          });
          setIsEditModalOpen(false);
          setSelectedRoomId(null);
          setEditFormData(undefined);
          // Store đã update, không cần refetch
        } catch (error) {
          console.error("Update exam room error:", error);
        }
      }
    },
    [selectedRoomId, updateExamRoom]
  );

  /**
   * KHÔNG cần gọi fetchExamRooms sau delete
   * Store đã tự động update qua deleteExamRoom action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (selectedRoomId) {
      try {
        await deleteExamRoom(selectedRoomId);
        setIsDeleteDialogOpen(false);
        setSelectedRoomId(null);
        // Store đã update, không cần refetch
      } catch (error) {
        console.error("Delete exam room error:", error);
      }
    }
  }, [selectedRoomId, deleteExamRoom]);

  // ==================== Render ====================

  if (loading && examRooms.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-8"></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Create Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý phòng thi
            </h1>
            <p className="text-muted-foreground mt-1">
              Tạo và quản lý các phòng thi trực tuyến
            </p>
          </div>
          <Button onClick={handleCreateRoom}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phòng thi mới
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <RoomStatsSection stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Exam Rooms - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ExamRoomList
              rooms={filteredRooms}
              filter={roomFilter}
              onFilterChange={setRoomFilter}
              onViewRoom={handleViewRoom}
              onEditRoom={handleEditRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          </div>

          {/* Recent Participants - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentParticipantsList
              participants={mockParticipants}
              onViewAll={() => console.log("View all participants")}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExamRoomModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        quizSets={quizSetOptions}
        isLoading={loading}
        onSubmit={handleCreateSubmit}
      />

      <ExamRoomModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        quizSets={quizSetOptions}
        isLoading={loading}
        initialData={editFormData}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa phòng thi"
        description="Bạn có chắc chắn muốn xóa phòng thi này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
