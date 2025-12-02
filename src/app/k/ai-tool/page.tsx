"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestGenerator } from "@/components/organisms/k/TestGenerator";
import { FlashcardGenerator } from "@/components/organisms/k/FlashcardGenerator";
import { RecentFilesList } from "@/components/molecules/RecentFilesList";
import {
  FileText,
  SquareSplitVertical,
  Sparkles,
  Cpu,
  Zap,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentUpload } from "@/apis/aiApi";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";

export default function AIGeneratorPage() {
  const [activeTab, setActiveTab] = useState("test");
  const { loadFromUpload } = useRecentUploadsStore();

  const handleSelectUpload = (upload: RecentUpload) => {
    // Load upload data into the appropriate generator store based on current tab
    const type = activeTab === "test" ? "quiz" : "flashcard";
    loadFromUpload(upload, type);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header Section */}
      <section className="relative container mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-lg" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
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

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              Powered by{" "}
              <span className="text-foreground font-medium">Gemini AI</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="flex gap-6">
          {/* Sidebar - Recent Files */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-6 border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  File gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentFilesList onSelectUpload={handleSelectUpload} />
              </CardContent>
            </Card>
          </aside>

          {/* Main Generator */}
          <div className="flex-1 min-w-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full">
              <TabsList className="grid grid-cols-2 h-14 p-1.5 bg-white/[0.03] border border-white/10 backdrop-blur-xl w-full md:w-fit rounded-xl">
                <TabsTrigger
                  value="test"
                  className="flex items-center gap-2.5 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Đề kiểm tra</span>
                </TabsTrigger>
                <TabsTrigger
                  value="flashcard"
                  className="flex items-center gap-2.5 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300">
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
        </div>
      </section>
    </div>
  );
}
