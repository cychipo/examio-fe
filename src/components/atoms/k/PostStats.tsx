import { Heart, MessageSquare, Share, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostStatsProps {
  likes: number;
  comments: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export function PostStats({
  likes,
  comments,
  onLike,
  onComment,
  onShare,
  onDownload,
}: PostStatsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground">
        <Heart className="h-4 w-4" />
        <span className="text-sm">{likes} thích</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onComment}
        className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm">{comments} bình luận</span>
      </Button>

      {onShare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground">
          <Share className="h-4 w-4" />
          <span className="text-sm">Chia sẻ</span>
        </Button>
      )}

      {onDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground">
          <Download className="h-4 w-4" />
          <span className="text-sm">Tải xuống</span>
        </Button>
      )}
    </div>
  );
}
