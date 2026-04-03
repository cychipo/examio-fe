import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getRecentFlashcardSetsApi,
  generateShareLinkApi,
  type RecentFlashcardSet,
} from "@/apis/studentMaterialsApi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Share2, Eye, Clock, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MyMaterialsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<RecentFlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    setId: string;
    shareUrl: string;
    accessCode: string;
  }>({
    open: false,
    setId: "",
    shareUrl: "",
    accessCode: "",
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await getRecentFlashcardSetsApi(20);
      setMaterials(data.flashcardSets);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      toast.error("Không thể tải tài liệu học tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "teacher") {
      navigate("/k/flash-card", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReview = (setId: string) => {
    navigate(`/study-flashcard/${setId}`);
  };

  const handleShare = async (setId: string) => {
    try {
      const data = await generateShareLinkApi(setId);
      const shareUrl =
        data.shareUrl || `${window.location.origin}/study-flashcard/${setId}`;

      setShareDialog({
        open: true,
        setId,
        shareUrl,
        accessCode: data.accessCode,
      });
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error("Không thể tạo liên kết chia sẻ");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareDialog.shareUrl);
    toast.success("Đã sao chép liên kết!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareDialog.accessCode);
    toast.success("Đã sao chép mã truy cập!");
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-background p-6 pb-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tài liệu học tập</h1>
          <p className="mt-1 text-muted-foreground">
            Các bộ flashcard bạn đã xem gần đây
          </p>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            Chưa có tài liệu học tập nào
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Bắt đầu khám phá và học các bộ flashcard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader className="p-0">
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary to-purple-600">
                  {material.thumbnail ? (
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
                    <Eye className="h-3 w-3" />
                    {material.viewCount}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="min-h-[3.5rem] line-clamp-2 text-lg font-semibold">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {material.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{material.flashcardCount} thẻ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(material.lastViewedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {material.creator?.name || material.creator?.username || "Ẩn danh"}
                  </span>
                </div>

                {material.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{material.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${material.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 p-4 pt-0">
                <Button
                  onClick={() => handleReview(material.id)}
                  className="flex-1"
                  size="sm"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ôn tập
                </Button>
                <Button
                  onClick={() => handleShare(material.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Chia sẻ
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ tài liệu</DialogTitle>
            <DialogDescription>
              Chia sẻ bộ flashcard này với bạn bè của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Liên kết chia sẻ</label>
              <div className="flex gap-2">
                <Input value={shareDialog.shareUrl} readOnly />
                <Button onClick={handleCopyLink} size="sm">
                  Sao chép
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã truy cập</label>
              <div className="flex gap-2">
                <Input value={shareDialog.accessCode} readOnly />
                <Button onClick={handleCopyCode} size="sm">
                  Sao chép
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Người khác có thể sử dụng mã này để truy cập tài liệu
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
