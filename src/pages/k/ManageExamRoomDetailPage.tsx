import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Plus,
  Share2,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamSessionFormModal } from "@/components/organisms/ExamSessionFormModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSESS_TYPE } from "@/types/examSession";
import type { ExamSessionBasic } from "@/types/examRoom";
import { TeacherRoute } from "@/components/organisms/TeacherRoute";
import { useExamRoomDetailStore } from "@/stores/useExamRoomDetailStore";
import { useExamRoomStore } from "@/stores/useExamRoomStore";

const PAGE_SIZE = 10;

export default function ManageExamRoomDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
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

  const [sessionsPage, setSessionsPage] = useState(1);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingSession, setEditingSession] = useState<ExamSessionBasic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExamRoomById(id);
    }

    return () => {
      reset();
    };
  }, [id, fetchExamRoomById, reset]);

  useEffect(() => {
    if (id) {
      fetchSessions(id, sessionsPage, PAGE_SIZE);
    }
  }, [id, sessionsPage, fetchSessions]);

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
    const totalAttempts = sessions.reduce((sum, s) => sum + (s._count?.examAttempts || 0), 0);

    return {
      total,
      upcoming,
      ongoing,
      completed,
      totalAttempts,
      totalParticipants: totalDistinctParticipants,
    };
  }, [sessions, totalDistinctParticipants]);

  const getStatusBadge = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    if (now < start) return <Badge variant="secondary">Sắp diễn ra</Badge>;
    if ((end && now < end) || !end) return <Badge variant="default">Đang diễn ra</Badge>;
    return <Badge variant="outline">Đã kết thúc</Badge>;
  };

  const handleCopyLink = () => {
    if (!selectedSessionId) return;
    const link = `${window.location.origin}/exam-session/${selectedSessionId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Đã sao chép link!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = async (data: {
    startTime: string;
    endTime?: string;
    assessType: ASSESS_TYPE;
    accessCode?: string | null;
    whitelist?: string[];
    allowRetake: boolean;
    maxAttempts: number;
    showAnswersAfterSubmit?: boolean;
    passingScore?: number;
    questionCount?: number | null;
    questionSelectionMode?: number;
    labelQuestionConfig?: any[] | null;
    shuffleQuestions?: boolean;
  }) => {
    let success = false;

    if (formMode === "create") {
      success = await createSession({ examRoomId: id, ...data });
    } else if (editingSession) {
      success = await updateSession(editingSession.id, data);
    }

    return success;
  };

  const renderPagination = () => {
    if (sessionsTotalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setSessionsPage((prev) => prev - 1)} disabled={sessionsPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Trang {sessionsPage} / {sessionsTotalPages}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSessionsPage((prev) => prev + 1)}
          disabled={sessionsPage === sessionsTotalPages}
        >
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
            <Button variant="link" onClick={() => navigate("/k/manage-exam-room")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TeacherRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/k/manage-exam-room">Quản lý Phòng thi</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentExamRoom.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button onClick={() => { setFormMode("create"); setEditingSession(null); setFormModalOpen(true); }} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiên thi
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 py-6"><div className="rounded-full p-3 bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Tổng phiên thi</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 py-6"><div className="rounded-full p-3 bg-green-500/10"><PlayCircle className="h-6 w-6 text-green-500" /></div><div><p className="text-2xl font-bold">{stats.ongoing}</p><p className="text-sm text-muted-foreground">Đang diễn ra</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 py-6"><div className="rounded-full p-3 bg-secondary/10"><Users className="h-6 w-6 text-secondary" /></div><div><p className="text-2xl font-bold">{stats.totalParticipants}</p><p className="text-sm text-muted-foreground">Thí sinh tham gia</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 py-6"><div className="rounded-full p-3 bg-orange-500/10"><CheckCircle2 className="h-6 w-6 text-orange-500" /></div><div><p className="text-2xl font-bold">{stats.totalAttempts}</p><p className="text-sm text-muted-foreground">Lượt làm bài</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin phòng thi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3"><div className="rounded-lg p-2 bg-muted"><Calendar className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm font-medium">Bộ đề</p><p className="text-sm text-muted-foreground">{currentExamRoom.quizSet?.title || "Chưa có bộ đề"}</p></div></div>
              <div className="flex items-start gap-3"><div className="rounded-lg p-2 bg-muted"><Users className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm font-medium">Người tổ chức</p><p className="text-sm text-muted-foreground">{currentExamRoom.host?.name || currentExamRoom.host?.username}</p></div></div>
              <div className="flex items-start gap-3"><div className="rounded-lg p-2 bg-muted"><Clock className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm font-medium">Ngày tạo</p><p className="text-sm text-muted-foreground">{format(new Date(currentExamRoom.createdAt), "dd/MM/yyyy")}</p></div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách phiên thi</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Quản lý các phiên thi trong phòng</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary flex items-center"><Timer className="h-3 w-3 mr-1" />{stats.upcoming} sắp tới</Badge>
                <Badge variant="outline" className="text-green-500"><PlayCircle className="h-3 w-3 mr-1" />{stats.ongoing} đang thi</Badge>
                <Badge variant="outline" className="text-gray-500"><CheckCircle2 className="h-3 w-3 mr-1" />{stats.completed} đã kết thúc</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Chưa có phiên thi nào</p>
                <p className="text-sm mb-4">Tạo phiên thi đầu tiên để bắt đầu tổ chức bài kiểm tra</p>
                <Button onClick={() => { setFormMode("create"); setEditingSession(null); setFormModalOpen(true); }}>
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
                        <TableHead className="text-center"><Users className="h-4 w-4 inline mr-1" />Thí sinh</TableHead>
                        <TableHead className="text-center"><CheckCircle2 className="h-4 w-4 inline mr-1" />Bài làm</TableHead>
                        <TableHead className="text-right w-[100px]">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id} className="hover:bg-muted/30">
                          <TableCell>{getStatusBadge(session.startTime, session.endTime || "")}</TableCell>
                          <TableCell className="font-medium">{format(new Date(session.startTime), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell>{session.endTime ? format(new Date(session.endTime), "dd/MM/yyyy HH:mm") : <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline">{session.distinctUserCount || 0}</Badge></TableCell>
                          <TableCell className="text-center"><Badge variant="outline">{session._count?.examAttempts || 0}</Badge></TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedSessionId(session.id); setShareDialogOpen(true); setCopied(false); }}><Share2 className="h-4 w-4 mr-2" />Chia sẻ</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/k/manage-exam-room/${id}/session/${session.id}`)}><BarChart3 className="h-4 w-4 mr-2" />Xem thống kê</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setFormMode("edit"); setEditingSession(session); setFormModalOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setDeletingSessionId(session.id); setDeleteDialogOpen(true); }} className="text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" />Xóa</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination()}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Chia sẻ phiên thi</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedSessionId ? `${window.location.origin}/exam-session/${selectedSessionId}` : ""}
                  className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Chia sẻ link này để mọi người có thể truy cập phiên thi.</p>
            </div>
          </DialogContent>
        </Dialog>

        <ExamSessionFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          mode={formMode}
          examRoomId={id}
          session={editingSession}
          onSubmit={handleFormSubmit}
          isLoading={mutationLoading}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xóa phiên thi"
          description="Bạn có chắc chắn muốn xóa phiên thi này? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
          isLoading={mutationLoading}
          onConfirm={async () => {
            if (!deletingSessionId) return;
            const success = await deleteSession(deletingSessionId, id);
            if (success) {
              setDeleteDialogOpen(false);
              setDeletingSessionId(null);
              fetchSessions(id, sessionsPage, PAGE_SIZE, { forceRefresh: true });
            }
          }}
        />
      </div>
    </TeacherRoute>
  );
}
