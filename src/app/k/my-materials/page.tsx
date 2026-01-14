"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getRecentFlashcardSetsApi,
  generateShareLinkApi,
  type RecentFlashcardSet,
} from "@/apis/studentMaterialsApi";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Share2, Eye, Clock, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MyMaterialsPage() {
  const router = useRouter();
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

  useEffect(() => {
    if (user && user.role === "teacher") {
      router.replace("/k/flash-card");
    }
  }, [user, router]);

  useEffect(() => {
    fetchMaterials();
  }, []);

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

  const handleReview = (setId: string) => {
    router.push(`/k/manage-flashcard-set/${setId}`);
  };

  const handleShare = async (setId: string) => {
    try {
      const { shareUrl, accessCode } = await generateShareLinkApi(setId);
      setShareDialog({
        open: true,
        setId,
        shareUrl,
        accessCode,
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
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tài liệu học tập</h1>
          <p className="text-muted-foreground mt-1">
            Các bộ flashcard bạn đã xem gần đây
          </p>
        </div>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Chưa có tài liệu học tập nào
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Bắt đầu khám phá và học các bộ flashcard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="p-0">
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  {material.thumbnail ? (
                    <Image
                      src={material.thumbnail}
                      alt={material.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {material.viewCount}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
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
                    {material.creator.name || material.creator.username}
                  </span>
                </div>

                {material.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{material.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${material.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  onClick={() => handleReview(material.id)}
                  className="flex-1"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ôn tập
                </Button>
                <Button
                  onClick={() => handleShare(material.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}>
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
