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
import {
  getExamAttemptsByRoomApi,
  type ExamAttemptListItem,
} from "@/apis/examAttemptApi";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ManageExamRoomPage() {
  const router = useRouter();

  const {
    examRooms,
    loading,
    fetchAllExamRooms,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom,
  } = useExamRoomStore();

  const { fetchAllQuizSets, quizSetsK } = useQuizSetStore();

  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<
    ExamRoomFormData | undefined
  >();
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>(
    []
  );
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  /**
   * Load exam rooms - chỉ gọi 1 lần khi mount
   */
  useEffect(() => {
    fetchAllExamRooms();
  }, [fetchAllExamRooms]);

  /**
   * Load quiz sets cho form dropdown - chỉ gọi 1 lần
   */
  useEffect(() => {
    fetchAllQuizSets();
  }, [fetchAllQuizSets]);

  /**
   * Fetch recent participants from all exam rooms
   */
  useEffect(() => {
    const fetchRecentParticipants = async () => {
      if (examRooms.length === 0) return;

      setLoadingParticipants(true);
      try {
        // Fetch attempts from all rooms with distinctUser=true to get unique users
        const attemptsPromises = examRooms.map((room) =>
          getExamAttemptsByRoomApi(room.id, 1, 10, true).catch(() => ({
            attempts: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          }))
        );

        const results = await Promise.all(attemptsPromises);
        const allAttempts: ExamAttemptListItem[] = [];

        results.forEach((result, index) => {
          result.attempts.forEach((attempt) => {
            allAttempts.push({
              ...attempt,
              examRoomTitle: examRooms[index].title,
            } as any);
          });
        });

        // Sort by startedAt descending and take top 5
        // Backend already ensures distinct users per room
        const sortedAttempts = allAttempts
          .sort(
            (a, b) =>
              new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          )
          .slice(0, 5);

        // Transform to Participant format
        const participants: Participant[] = sortedAttempts.map((attempt) => ({
          id: attempt.id,
          name: attempt.user.name || attempt.user.username,
          examName: (attempt as any).examRoomTitle || "Phòng thi",
          status: "offline" as const, // Default status
        }));

        setRecentParticipants(participants);
      } catch (error) {
        console.error("Failed to fetch recent participants:", error);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchRecentParticipants();
  }, [examRooms]);

  /**
   * Tính toán stats từ examRooms
   */
  const stats = useMemo(() => {
    const activeRooms = examRooms.length; // All rooms are counted

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
      roomType: room.quizSet?.title || "Chưa có bộ đề",
      questionCount:
        room.quizSet?._count?.detailsQuizQuestions ||
        room.quizSet?.questionCount ||
        0,
      isPrivate: false, // Security settings are now per ExamSession
    }));
  }, [examRooms]);

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
      <div className="min-h-screen">
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
    <div className="min-h-screen">
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
              rooms={transformedRooms}
              onViewRoom={handleViewRoom}
              onEditRoom={handleEditRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          </div>

          {/* Recent Participants - Takes 1 column */}
          <div className="lg:col-span-1">
            {loadingParticipants ? (
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            ) : (
              <RecentParticipantsList
                participants={recentParticipants}
                onViewAll={() => console.log("View all participants")}
              />
            )}
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
