"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestGenerator } from "@/components/organisms/k/TestGenerator";
import { FlashcardGenerator } from "@/components/organisms/k/FlashcardGenerator";
import { RecentFilesList } from "@/components/molecules/RecentFilesList";
import { FileText, SquareSplitVertical, Sparkles, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecentUpload } from "@/apis/aiApi";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";

import { AIModelType, DEFAULT_AI_MODEL } from "@/types/ai";
import { TeacherRoute } from "@/components/organisms/TeacherRoute";

function AIGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "test";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [_selectedModel, _setSelectedModel] =
    useState<AIModelType>(DEFAULT_AI_MODEL);
  const { loadFromUpload } = useRecentUploadsStore();

  // Sync URL with tab state
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

  const handleSelectUpload = (upload: RecentUpload) => {
    // Load upload data into BOTH generators (already handled in loadFromUpload)
    loadFromUpload(upload);
  };

  return (
    <div className="min-h-screen relative overflow-hidden max-w-7xl mx-auto">
      {/* Background Effects */}

      {/* Header Section */}
      <section className="relative container mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-border flex items-center justify-center">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                AI Generator
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Tạo đề kiểm tra & flashcard từ tài liệu PDF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Generator - Now on the left */}
          <div className="flex-1 min-w-0">
            <Tabs
              id="ai-generator-tabs"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 h-14 p-1.5 bg-white/[0.03] border border-border backdrop-blur-xl w-full md:w-fit rounded-xl">
                <TabsTrigger
                  value="test"
                  className="flex items-center gap-2.5 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Đề kiểm tra</span>
                </TabsTrigger>
                <TabsTrigger
                  value="flashcard"
                  className="flex items-center gap-2.5 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300"
                >
                  <SquareSplitVertical className="w-4 h-4" />
                  <span className="font-medium">Flashcard</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="test" className="m-0">
                  <TestGenerator />
                </TabsContent>

                <TabsContent value="flashcard" className="m-0">
                  <FlashcardGenerator />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar - Recent Files - Now on the right */}
          <aside className="w-full lg:w-xl flex-shrink-0 mt-22">
            <Card className="border-border bg-white/[0.02] backdrop-blur-xl lg:sticky lg:top-6">
              <CardContent>
                <RecentFilesList onSelectUpload={handleSelectUpload} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default function AIGeneratorPage() {
  return (
    <TeacherRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <AIGeneratorContent />
      </Suspense>
    </TeacherRoute>
  );
}
