import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/atoms/k/UserAvatar";
import { PostTag } from "@/components/atoms/k/PostTag";
import { PostStats } from "@/components/atoms/k/PostStats";

export interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  category: string;
  title: string;
  description: string;
  tags?: string[];
  likes: number;
  comments: number;
}

interface PostCardProps {
  post: Post;
  onPostClick?: () => void;
}

export function PostCard({ post, onPostClick }: PostCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <UserAvatar
            src={post.author.avatar}
            alt={post.author.name}
            fallback={post.author.name.slice(0, 2).toUpperCase()}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {post.author.name}
              </h3>
              <span className="text-sm text-muted-foreground">
                {post.timestamp}
              </span>
            </div>
            <PostTag label={post.category} variant="primary" className="mt-1" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 cursor-pointer space-y-2" onClick={onPostClick}>
          <h2 className="text-lg font-semibold text-foreground hover:text-primary">
            {post.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <PostTag key={index} label={tag} />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 border-t pt-3">
          <PostStats
            likes={post.likes}
            comments={post.comments}
            onShare={() => console.log("Share")}
            onDownload={() => console.log("Download")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
