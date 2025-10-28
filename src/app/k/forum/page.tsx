"use client";

import { useState } from "react";
import { ForumTemplate } from "@/templates/ForumTemplate";
import type { Category } from "@/components/molecules/CategoryItem";
import type { Post } from "@/components/molecules/PostCard";
import type { TrendingTopic } from "@/components/molecules/TrendingTopicItem";
import type { StudySession } from "@/components/molecules/UpcomingSessionCard";
import type { Contributor } from "@/components/organisms/k/TopContributors";
import {
  BookOpen,
  Layers,
  Users,
  FileQuestion,
  MessageSquare,
} from "lucide-react";

// Mock categories
const mockCategories: Category[] = [
  {
    id: "exam-prep",
    name: "Ôn thi",
    icon: BookOpen,
    count: 24,
  },
  {
    id: "flashcards",
    name: "Flashcards",
    icon: Layers,
    count: 18,
  },
  {
    id: "study-rooms",
    name: "Phòng học",
    icon: Users,
    count: 12,
  },
  {
    id: "study-methods",
    name: "Phương pháp học",
    icon: MessageSquare,
    count: 31,
  },
  {
    id: "qna",
    name: "Hỏi đáp",
    icon: FileQuestion,
    count: 47,
  },
];

// Mock posts
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Emma Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
    timestamp: "2 giờ trước",
    category: "Ôn thi",
    title: "Giải tích nâng cao - Hướng dẫn ôn thi cuối kỳ & Bài tập thực hành",
    description:
      "Tôi đã tổng hợp một hướng dẫn học tập toàn diện cho kỳ thi cuối kỳ môn Giải tích nâng cao. Bao gồm hơn 50+ bài tập thực hành với lời giải chi tiết, các công thức quan trọng và những lỗi phổ biến...",
    likes: 24,
    comments: 8,
  },
  {
    id: "2",
    author: {
      name: "David Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    timestamp: "4 giờ trước",
    category: "Phòng học",
    title: "Phòng học ảo: Buổi học nhóm Hóa hữu cơ",
    description:
      "Tham gia phòng học ảo của chúng tôi để học Hóa hữu cơ! Chúng ta sẽ cùng nhau tìm hiểu về cơ chế phản ứng và các con đường tổng hợp. Buổi học bắt đầu lúc 7 giờ tối EST. Mọi cấp độ đều được chào đón!",
    likes: 18,
    comments: 5,
  },
  {
    id: "3",
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    timestamp: "1 ngày trước",
    category: "Phương pháp học",
    title:
      "Kỹ thuật Pomodoro đã thay đổi thói quen học tập của tôi như thế nào",
    description:
      "Sau khi áp dụng kỹ thuật Pomodoro trong 3 tháng, năng suất học tập của tôi đã tăng 40%. Hãy cùng tôi chia sẻ cách tôi cấu trúc các buổi học và những công cụ tôi sử dụng...",
    tags: ["Năng suất", "Quản lý thời gian", "Mẹo học tập"],
    likes: 156,
    comments: 32,
  },
  {
    id: "4",
    author: {
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    timestamp: "1 ngày trước",
    category: "Flashcards",
    title: "Bộ Flashcards Sinh học - 500 thẻ với hình minh họa",
    description:
      "Bộ flashcards sinh học toàn diện bao gồm các chủ đề: Di truyền học, Sinh lý tế bào, Tiến hóa và Sinh thái học. Mỗi thẻ đều có hình minh họa và gợi ý ghi nhớ.",
    tags: ["Sinh học", "Flashcards", "Học tập trực quan"],
    likes: 89,
    comments: 15,
  },
  {
    id: "5",
    author: {
      name: "Alex Thompson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    timestamp: "2 ngày trước",
    category: "Hỏi đáp",
    title: "Cần giúp đỡ về Phương trình vi phân - Bài tập về cấp hai",
    description:
      "Tôi đang gặp khó khăn với bài toán phương trình vi phân cấp hai. Ai đó có thể giải thích phương pháp biến thiên hằng số được không? Tôi đã thử nhiều lần nhưng vẫn không ra kết quả đúng.",
    tags: ["Toán học", "Cần giúp đỡ", "Vi phân"],
    likes: 12,
    comments: 23,
  },
];

// Mock trending topics
const mockTrendingTopics: TrendingTopic[] = [
  { id: "1", tag: "FinalExams2024", count: 234 },
  { id: "2", tag: "StudyTips", count: 189 },
  { id: "3", tag: "MathHelp", count: 156 },
  { id: "4", tag: "GroupStudy", count: 143 },
];

// Mock upcoming sessions
const mockUpcomingSessions: StudySession[] = [
  {
    id: "1",
    title: "Nhóm học Vật lý",
    date: "Hôm nay",
    time: "3:00 chiều",
    participants: 12,
  },
  {
    id: "2",
    title: "Ôn tập Phòng thí nghiệm Sinh học",
    date: "Ngày mai",
    time: "2:00 chiều",
    participants: 8,
  },
  {
    id: "3",
    title: "Thảo luận Lịch sử",
    date: "Thứ Sáu",
    time: "4:00 chiều",
    participants: 15,
  },
];

// Mock top contributors
const mockContributors: Contributor[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexC",
    posts: 142,
    rank: 1,
  },
  {
    id: "2",
    name: "Sarah Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK",
    posts: 98,
    rank: 2,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJ",
    posts: 87,
    rank: 3,
  },
];

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("exam-prep");
  const [activeTab, setActiveTab] = useState<"latest" | "popular" | "trending">(
    "latest"
  );

  const handlePostClick = (postId: string) => {
    console.log("Post clicked:", postId);
    // Navigate to post detail page
  };

  const handleTopicClick = (topicId: string) => {
    console.log("Topic clicked:", topicId);
    // Filter posts by topic
  };

  const handleSessionJoin = (sessionId: string) => {
    console.log("Join session:", sessionId);
    // Navigate to study room
  };

  // Filter posts by category
  const filteredPosts = mockPosts;

  return (
    <ForumTemplate
      categories={mockCategories}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      posts={filteredPosts}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onPostClick={handlePostClick}
      trendingTopics={mockTrendingTopics}
      upcomingSessions={mockUpcomingSessions}
      topContributors={mockContributors}
      onTopicClick={handleTopicClick}
      onSessionJoin={handleSessionJoin}
    />
  );
}
