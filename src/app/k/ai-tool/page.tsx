"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Sparkles, SquareSplitVertical, Cpu } from "lucide-react";
import { RecentUpload } from "@/apis/aiApi";
import { RecentFilesList } from "@/components/molecules/RecentFilesList";
import { FlashcardGenerator } from "@/components/organisms/k/FlashcardGenerator";
import { TestGenerator } from "@/components/organisms/k/TestGenerator";
import { TeacherRoute } from "@/components/organisms/TeacherRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";

function AIGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "test";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const { loadFromUpload } = useRecentUploadsStore();

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

  const handleSelectUpload = (upload: RecentUpload) => {
    loadFromUpload(upload);
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-7xl overflow-hidden">
      <section className="relative container mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 blur-lg" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Cpu className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-2xl font-bold md:text-3xl">
                AI Generator
              </h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Tạo đề kiểm tra & flashcard từ tài liệu PDF
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 pb-20">
        <Tabs
          id="ai-generator-tabs"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full gap-6"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:items-start">
            <div className="min-w-0 space-y-6">
              <Card className="border-border bg-white/[0.02] backdrop-blur-xl">
                <CardContent className="space-y-4 px-5 md:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                        Workspace
                      </p>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Chọn chế độ tạo nội dung
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Chuyển nhanh giữa tạo đề kiểm tra và flashcard trong cùng
                          một không gian làm việc.
                        </p>
                      </div>
                    </div>

                    <TabsList className="grid h-14 w-full grid-cols-2 rounded-xl border border-border bg-white/[0.03] p-1.5 sm:w-fit">
                      <TabsTrigger
                        value="test"
                        className="flex items-center gap-2.5 rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Đề kiểm tra</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="flashcard"
                        className="flex items-center gap-2.5 rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                      >
                        <SquareSplitVertical className="h-4 w-4" />
                        <span className="font-medium">Flashcard</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="test" className="m-0">
                <TestGenerator />
              </TabsContent>

              <TabsContent value="flashcard" className="m-0">
                <FlashcardGenerator />
              </TabsContent>
            </div>

            <aside className="min-w-0">
              <Card className="border-border bg-white/[0.02] backdrop-blur-xl xl:sticky xl:top-6">
                <CardContent className="px-5 md:px-6">
                  <RecentFilesList onSelectUpload={handleSelectUpload} />
                </CardContent>
              </Card>
            </aside>
          </div>
        </Tabs>
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
