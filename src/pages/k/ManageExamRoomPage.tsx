import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getExamAttemptsByRoomApi, type ExamAttemptListItem } from "@/apis/examAttemptApi";
import { ExamRoomModal } from "@/components/organisms/ExamRoomModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { RoomStatsSection } from "@/components/organisms/k/RoomStatsSection";
import { ExamRoomList, type ExamRoom as ExamRoomListType } from "@/components/organisms/k/ExamRoomList";
import { RecentParticipantsList, type Participant } from "@/components/organisms/k/RecentParticipantsList";
import { Button } from "@/components/ui/button";
import { TeacherRoute } from "@/components/organisms/TeacherRoute";
import type { ExamRoomFormData } from "@/components/molecules/ExamRoomForm";
import { useExamRoomStore } from "@/stores/useExamRoomStore";
import { useQuizSetStore } from "@/stores/useQuizSetStore";

export default function ManageExamRoomPage() {
  const navigate = useNavigate();
  const {
    examRooms,
    loading,
    fetchAllExamRooms,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom,
  } = useExamRoomStore();
  const { fetchAllQuizSets, quizSetsK } = useQuizSetStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<ExamRoomFormData | undefined>();
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    fetchAllExamRooms();
  }, [fetchAllExamRooms]);

  useEffect(() => {
    fetchAllQuizSets();
  }, [fetchAllQuizSets]);

  useEffect(() => {
    const fetchRecentParticipants = async () => {
      if (examRooms.length === 0) return;

      setLoadingParticipants(true);
      try {
        const attemptsPromises = examRooms.map((room) =>
          getExamAttemptsByRoomApi(room.id, 1, 10, true).catch(() => ({
            attempts: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          })),
        );

        const results = await Promise.all(attemptsPromises);
        const allAttempts: ExamAttemptListItem[] = [];

        results.forEach((result, index) => {
          result.attempts.forEach((attempt) => {
            allAttempts.push({
              ...attempt,
              examRoomTitle: examRooms[index].title,
            } as ExamAttemptListItem & { examRoomTitle: string });
          });
        });

        const participants: Participant[] = allAttempts
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, 5)
          .map((attempt) => ({
            id: attempt.id,
            name: attempt.user.name || attempt.user.username,
            examName: (attempt as ExamAttemptListItem & { examRoomTitle?: string }).examRoomTitle || "Phòng thi",
            status: "offline",
            avatar: attempt.user.avatar || "",
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

  const stats = useMemo(() => {
    const activeRooms = examRooms.length;
    const totalParticipants = examRooms.reduce((sum, room) => sum + (room._count?.examSessions || 0), 0);

    return {
      activeRooms,
      totalParticipants,
      ongoingExams: 0,
      completedToday: 0,
    };
  }, [examRooms]);

  const transformedRooms = useMemo<ExamRoomListType[]>(() => {
    return examRooms.map((room) => ({
      id: room.id,
      name: room.title,
      roomType: room.quizSet?.title || "Chưa có bộ đề",
      questionCount: room.quizSet?._count?.detailsQuizQuestions || room.quizSet?.questionCount || 0,
      isPrivate: false,
    }));
  }, [examRooms]);

  const quizSetOptions = useMemo(
    () =>
      quizSetsK.map((qs) => ({
        id: qs.id,
        title: qs.title,
        questionCount: qs.questionCount,
      })),
    [quizSetsK],
  );

  const handleEditRoom = useCallback(
    (id: string) => {
      const room = examRooms.find((item) => item.id === id);
      if (!room) return;

      setEditFormData({
        title: room.title,
        description: room.description || "",
        quizSetId: room.quizSetId,
      });
      setSelectedRoomId(id);
      setIsEditModalOpen(true);
    },
    [examRooms],
  );

  const handleCreateSubmit = useCallback(
    async (data: ExamRoomFormData) => {
      try {
        await createExamRoom({
          title: data.title,
          description: data.description,
          quizSetId: data.quizSetId,
        });
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Create exam room error:", error);
      }
    },
    [createExamRoom],
  );

  const handleEditSubmit = useCallback(
    async (data: ExamRoomFormData) => {
      if (!selectedRoomId) return;

      try {
        await updateExamRoom(selectedRoomId, {
          title: data.title,
          description: data.description,
          quizSetId: data.quizSetId,
        });
        setIsEditModalOpen(false);
        setSelectedRoomId(null);
        setEditFormData(undefined);
      } catch (error) {
        console.error("Update exam room error:", error);
      }
    },
    [selectedRoomId, updateExamRoom],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRoomId) return;

    try {
      await deleteExamRoom(selectedRoomId);
      setIsDeleteDialogOpen(false);
      setSelectedRoomId(null);
    } catch (error) {
      console.error("Delete exam room error:", error);
    }
  }, [selectedRoomId, deleteExamRoom]);

  if (loading && examRooms.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-8" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TeacherRoute>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý phòng thi</h1>
              <p className="text-muted-foreground mt-1">Tạo và quản lý các phòng thi trực tuyến</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo phòng thi mới
            </Button>
          </div>

          <div className="mb-8">
            <RoomStatsSection stats={stats} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ExamRoomList
                rooms={transformedRooms}
                onViewRoom={(id) => navigate(`/k/manage-exam-room/${id}`)}
                onEditRoom={handleEditRoom}
                onDeleteRoom={(id) => {
                  setSelectedRoomId(id);
                  setIsDeleteDialogOpen(true);
                }}
              />
            </div>

            <div className="lg:col-span-1">
              {loadingParticipants ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded" />
                </div>
              ) : (
                <RecentParticipantsList participants={recentParticipants} onViewAll={() => {}} />
              )}
            </div>
          </div>
        </div>

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
    </TeacherRoute>
  );
}
