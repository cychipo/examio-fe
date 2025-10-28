import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostCard, type Post } from "@/components/molecules/PostCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PostsListProps {
  posts: Post[];
  activeTab: "latest" | "popular" | "trending";
  onTabChange: (tab: "latest" | "popular" | "trending") => void;
  onPostClick?: (postId: string) => void;
}

export function PostsList({
  posts,
  activeTab,
  onTabChange,
  onPostClick,
}: PostsListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Bài viết mới nhất
          </h2>
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="latest">Mới nhất</TabsTrigger>
              <TabsTrigger value="popular">Phổ biến</TabsTrigger>
              <TabsTrigger value="trending">Xu hướng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-4 px-4 pb-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostClick={() => onPostClick?.(post.id)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Không có bài viết nào</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
