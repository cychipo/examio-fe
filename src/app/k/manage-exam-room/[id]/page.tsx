"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  PlayCircle,
  CheckCircle2,
  Timer,
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
import { ASSESS_TYPE } from "@/types/examSession";
import { ExamSessionFormModal } from "@/components/organisms/ExamSessionFormModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PAGE_SIZE = 10;

/**
 * ExamRoom Detail Page with tabbed interface
 * Shows list of exam sessions and participants with pagination
 * Uses store with caching to avoid unnecessary API calls when switching tabs
 */
export default function ExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentExamRoom, fetchExamRoomById, loading } = useExamRoomStore();
  const {
    sessions,
    sessionsTotalPages,
    totalDistinctParticipants,
    loadingSessions,
    mutationLoading,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    reset,
  } = useExamRoomDetailStore();

  // Pagination state
  const [sessionsPage, setSessionsPage] = useState(1);

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
    if (id) {
      fetchSessions(id, sessionsPage, PAGE_SIZE);
    }
  }, [id, sessionsPage, fetchSessions]);

  // Calculate stats from sessions
  const stats = useMemo(() => {
    const now = new Date();

    const total = sessions.length;
    const upcoming = sessions.filter((s) => new Date(s.startTime) > now).length;
    const ongoing = sessions.filter((s) => {
      const start = new Date(s.startTime);
      const end = s.endTime ? new Date(s.endTime) : null;
      return start <= now && (!end || end > now);
    }).length;
    const completed = sessions.filter((s) => {
      const end = s.endTime ? new Date(s.endTime) : null;
      return end && end <= now;
    }).length;

    const totalAttempts = sessions.reduce(
      (sum, s) => sum + (s._count?.examAttempts || 0),
      0
    );

    return {
      total,
      upcoming,
      ongoing,
      completed,
      totalAttempts,
      totalParticipants: totalDistinctParticipants,
    };
  }, [sessions, totalDistinctParticipants]);

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
    whitelist?: string[];
    allowRetake: boolean;
    maxAttempts: number;
    showAnswersAfterSubmit?: boolean;
  }) => {
    let success = false;

    if (formMode === "create") {
      success = await createSession({
        examRoomId: id,
        startTime: data.startTime,
        endTime: data.endTime,
        assessType: data.assessType,
        accessCode: data.accessCode,
        whitelist: data.whitelist,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts,
        showAnswersAfterSubmit: data.showAnswersAfterSubmit,
      });
    } else if (editingSession) {
      success = await updateSession(editingSession.id, {
        startTime: data.startTime,
        endTime: data.endTime,
        assessType: data.assessType,
        accessCode: data.accessCode,
        whitelist: data.whitelist,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts,
        showAnswersAfterSubmit: data.showAnswersAfterSubmit,
      });
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
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/k/manage-exam-room">Quản lý Phòng thi</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentExamRoom.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button onClick={handleCreateSession} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiên thi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full p-3 bg-blue-500/10">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tổng phiên thi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full p-3 bg-green-500/10">
              <PlayCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ongoing}</p>
              <p className="text-sm text-muted-foreground">Đang diễn ra</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full p-3 bg-purple-500/10">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Thí sinh tham gia</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full p-3 bg-orange-500/10">
              <CheckCircle2 className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              <p className="text-sm text-muted-foreground">Lượt làm bài</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin phòng thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Bộ đề</p>
                <p className="text-sm text-muted-foreground">
                  {currentExamRoom.quizSet?.title || "Chưa có bộ đề"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Người tổ chức</p>
                <p className="text-sm text-muted-foreground">
                  {currentExamRoom.host?.name || currentExamRoom.host?.username}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Ngày tạo</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(currentExamRoom.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách phiên thi</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý các phiên thi trong phòng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-blue-500 flex items-center">
                <div className="flex items-center">
                  <Timer className="h-3 w-3 mr-1" />
                  <p>{stats.upcoming} sắp tới</p>
                </div>
              </Badge>
              <Badge variant="outline" className="text-green-500">
                <div className="flex items-center">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  {stats.ongoing} đang thi
                </div>
              </Badge>
              <Badge variant="outline" className="text-gray-500">
                <div className="flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {stats.completed} đã kết thúc
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Chưa có phiên thi nào</p>
              <p className="text-sm mb-4">
                Tạo phiên thi đầu tiên để bắt đầu tổ chức bài kiểm tra
              </p>
              <Button onClick={handleCreateSession}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo phiên thi đầu tiên
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[140px]">Trạng thái</TableHead>
                      <TableHead>Thời gian bắt đầu</TableHead>
                      <TableHead>Thời gian kết thúc</TableHead>
                      <TableHead className="text-center">
                        <Users className="h-4 w-4 inline mr-1" />
                        Thí sinh
                      </TableHead>
                      <TableHead className="text-center">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        Bài làm
                      </TableHead>
                      <TableHead className="text-right w-[100px]">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: ExamSessionBasic) => (
                      <TableRow key={session.id} className="hover:bg-muted/30">
                        <TableCell>
                          {getStatusBadge(
                            session.startTime,
                            session.endTime || ""
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDateTime(session.startTime)}
                        </TableCell>
                        <TableCell>
                          {session.endTime ? (
                            formatDateTime(session.endTime)
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {session.distinctUserCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {session._count?.examAttempts || 0}
                          </Badge>
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
                                onClick={() => handleShareSession(session.id)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Chia sẻ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/k/manage-exam-room/${id}/session/${session.id}`
                                  )
                                }>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Xem thống kê
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
              </div>
              {renderPagination(
                sessionsPage,
                sessionsTotalPages,
                setSessionsPage
              )}
            </>
          )}
        </CardContent>
      </Card>

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
