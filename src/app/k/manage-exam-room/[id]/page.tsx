"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useExamRoomStore } from "@/stores/useExamRoomStore";
import { useExamRoomDetailStore } from "@/stores/useExamRoomDetailStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  Share2,
  Copy,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ExamSessionBasic } from "@/types/examRoom";
import { ExamSessionParticipant, ASSESS_TYPE } from "@/types/examSession";
import { ExamSessionFormModal } from "@/components/organisms/ExamSessionFormModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";

const PAGE_SIZE = 10;

type TabValue = "sessions" | "participants";

/**
 * ExamRoom Detail Page with tabbed interface
 * Shows list of exam sessions and participants with pagination
 * Uses store with caching to avoid unnecessary API calls when switching tabs
 */
export default function ExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const { currentExamRoom, fetchExamRoomById, loading } = useExamRoomStore();
  const {
    sessions,
    sessionsTotalPages,
    loadingSessions,
    participants,
    participantsTotalPages,
    loadingParticipants,
    mutationLoading,
    fetchSessions,
    fetchParticipants,
    createSession,
    updateSession,
    deleteSession,
    reset,
  } = useExamRoomDetailStore();

  // Tab state from URL
  const tabFromUrl = (searchParams.get("tab") as TabValue) || "sessions";
  const [activeTab, setActiveTab] = useState<TabValue>(tabFromUrl);

  // Pagination states
  const [sessionsPage, setSessionsPage] = useState(1);
  const [participantsPage, setParticipantsPage] = useState(1);

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  // Create/Edit modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingSession, setEditingSession] = useState<ExamSessionBasic | null>(
    null
  );

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  // Fetch exam room on mount
  useEffect(() => {
    if (id) {
      fetchExamRoomById(id);
    }

    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [id, fetchExamRoomById, reset]);

  // Fetch sessions data with caching
  useEffect(() => {
    if (id && activeTab === "sessions") {
      fetchSessions(id, sessionsPage, PAGE_SIZE);
    }
  }, [id, activeTab, sessionsPage, fetchSessions]);

  // Fetch participants data with caching
  useEffect(() => {
    if (id && activeTab === "participants") {
      fetchParticipants(id, participantsPage, PAGE_SIZE);
    }
  }, [id, activeTab, participantsPage, fetchParticipants]);

  // Update URL when tab changes
  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as TabValue;
      setActiveTab(tab);
      router.push(`/k/manage-exam-room/${id}?tab=${tab}`, { scroll: false });
    },
    [id, router]
  );

  // Get session status badge
  const getStatusBadge = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    if (now < start) {
      return <Badge variant="secondary">Sắp diễn ra</Badge>;
    } else if ((end && now < end) || !end) {
      return <Badge variant="default">Đang diễn ra</Badge>;
    } else {
      return <Badge variant="outline">Đã kết thúc</Badge>;
    }
  };

  // Get participant status badge
  const getParticipantStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Đang chờ
          </Badge>
        );
      case 1:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Đã duyệt
          </Badge>
        );
      case 2:
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Từ chối
          </Badge>
        );
      case 3:
        return <Badge variant="outline">Đã rời</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  // Handle share session
  const handleShareSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (selectedSessionId) {
      const link = `${window.location.origin}/exam-session/${selectedSessionId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Đã sao chép link!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle create session
  const handleCreateSession = () => {
    setFormMode("create");
    setEditingSession(null);
    setFormModalOpen(true);
  };

  // Handle edit session
  const handleEditSession = (session: ExamSessionBasic) => {
    setFormMode("edit");
    setEditingSession(session);
    setFormModalOpen(true);
  };

  // Handle delete session
  const handleDeleteClick = (sessionId: string) => {
    setDeletingSessionId(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingSessionId && id) {
      const success = await deleteSession(deletingSessionId, id);
      if (success) {
        setDeleteDialogOpen(false);
        setDeletingSessionId(null);
        // Refresh sessions list
        fetchSessions(id, sessionsPage, PAGE_SIZE, { forceRefresh: true });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: {
    startTime: string;
    endTime?: string;
    assessType: ASSESS_TYPE;
    accessCode?: string | null;
    allowRetake: boolean;
    maxAttempts: number;
  }) => {
    let success = false;

    if (formMode === "create") {
      success = await createSession({
        examRoomId: id,
        startTime: data.startTime,
        endTime: data.endTime,
        assessType: data.assessType,
        accessCode: data.accessCode,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts,
      });
    } else if (editingSession) {
      success = await updateSession(editingSession.id, {
        startTime: data.startTime,
        endTime: data.endTime,
        assessType: data.assessType,
        accessCode: data.accessCode,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts,
      });
    }

    if (success) {
      // Refresh sessions list
      fetchSessions(id, sessionsPage, PAGE_SIZE, { forceRefresh: true });
    }

    return success;
  };

  // Format datetime
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  // Render pagination
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!currentExamRoom) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Không tìm thấy phòng thi</p>
            <Button
              variant="link"
              onClick={() => router.push("/k/manage-exam-room")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/k/manage-exam-room")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentExamRoom.title}</h1>
            {currentExamRoom.description && (
              <p className="text-muted-foreground">
                {currentExamRoom.description}
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateSession}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiên thi
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Bộ đề</p>
              <p className="font-medium">{currentExamRoom.quizSet?.title}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Số phiên thi</p>
              <p className="font-medium">
                {currentExamRoom._count?.examSessions || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Người tổ chức</p>
              <p className="font-medium">
                {currentExamRoom.host?.name || currentExamRoom.host?.username}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Danh sách phiên thi
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Người tham gia
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách phiên thi</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có phiên thi nào</p>
                  <Button variant="link" onClick={handleCreateSession}>
                    Tạo phiên thi đầu tiên
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thời gian bắt đầu</TableHead>
                        <TableHead>Thời gian kết thúc</TableHead>
                        <TableHead>Số người tham gia</TableHead>
                        <TableHead>Số bài làm</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session: ExamSessionBasic) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {getStatusBadge(
                              session.startTime,
                              session.endTime || ""
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(session.startTime)}
                          </TableCell>
                          <TableCell>
                            {session.endTime
                              ? formatDateTime(session.endTime)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {session._count?.participants || 0}
                          </TableCell>
                          <TableCell>
                            {session._count?.examAttempts || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleShareSession(session.id)
                                  }>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Chia sẻ
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditSession(session)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(session.id)}
                                  className="text-red-600 focus:text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination(
                    sessionsPage,
                    sessionsTotalPages,
                    setSessionsPage
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người tham gia</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có người tham gia nào</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người tham gia</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Phiên thi</TableHead>
                        <TableHead>Thời gian tham gia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map(
                        (participant: ExamSessionParticipant) => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={participant.user?.avatar} />
                                  <AvatarFallback>
                                    {participant.user?.name?.[0] ||
                                      participant.user?.username?.[0] ||
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {participant.user?.name ||
                                    participant.user?.username}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{participant.user?.email}</TableCell>
                            <TableCell>
                              {getParticipantStatusBadge(participant.status)}
                            </TableCell>
                            <TableCell>
                              {participant.examSession &&
                                formatDateTime(
                                  participant.examSession.startTime
                                )}
                            </TableCell>
                            <TableCell>
                              {participant.joinedAt
                                ? formatDateTime(participant.joinedAt)
                                : "—"}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                  {renderPagination(
                    participantsPage,
                    participantsTotalPages,
                    setParticipantsPage
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ phiên thi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  selectedSessionId
                    ? `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                      }/exam-session/${selectedSessionId}`
                    : ""
                }
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Chia sẻ link này để mọi người có thể truy cập phiên thi.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Session Modal */}
      <ExamSessionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        examRoomId={id}
        session={editingSession}
        onSubmit={handleFormSubmit}
        isLoading={mutationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa phiên thi"
        description="Bạn có chắc chắn muốn xóa phiên thi này? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        isLoading={mutationLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
