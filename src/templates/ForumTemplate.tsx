import { CategoriesSidebar } from "@/components/organisms/k/CategoriesSidebar";
import { PostsList } from "@/components/organisms/k/PostsList";
import { TrendingSidebar } from "@/components/organisms/k/TrendingSidebar";
import { TopContributors } from "@/components/organisms/k/TopContributors";
import type { Category } from "@/components/molecules/CategoryItem";
import type { Post } from "@/components/molecules/PostCard";
import type { TrendingTopic } from "@/components/molecules/TrendingTopicItem";
import type { StudySession } from "@/components/molecules/UpcomingSessionCard";
import type { Contributor } from "@/components/organisms/k/TopContributors";

interface ForumTemplateProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  posts: Post[];
  activeTab: "latest" | "popular" | "trending";
  onTabChange: (tab: "latest" | "popular" | "trending") => void;
  onPostClick?: (postId: string) => void;
  trendingTopics: TrendingTopic[];
  upcomingSessions: StudySession[];
  topContributors: Contributor[];
  onTopicClick?: (topicId: string) => void;
  onSessionJoin?: (sessionId: string) => void;
}

export function ForumTemplate({
  categories,
  activeCategory,
  onCategoryChange,
  posts,
  activeTab,
  onTabChange,
  onPostClick,
  trendingTopics,
  upcomingSessions,
  topContributors,
  onTopicClick,
  onSessionJoin,
}: ForumTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Diễn đàn</h1>
        <p className="text-muted-foreground mt-1">
          Chia sẻ kiến thức, đặt câu hỏi và kết nối với cộng đồng học tập
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
        {/* Categories Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block">
          <div className="space-y-6">
            <CategoriesSidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
            />
            <TopContributors contributors={topContributors} />
          </div>
        </aside>

        {/* Mobile Categories - Visible on mobile, hidden on lg+ */}
        <div className="lg:hidden">
          <CategoriesSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>

        {/* Posts List */}
        <main>
          <PostsList
            posts={posts}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onPostClick={onPostClick}
          />
        </main>

        {/* Trending Sidebar - Desktop only */}
        <aside className="hidden xl:block">
          <TrendingSidebar
            trendingTopics={trendingTopics}
            upcomingSessions={upcomingSessions}
            onTopicClick={onTopicClick}
            onSessionJoin={onSessionJoin}
          />
        </aside>
      </div>
    </div>
  );
}
