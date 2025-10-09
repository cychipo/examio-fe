"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestGenerator } from "@/components/organisms/k/TestGenerator";
import { FlashcardGenerator } from "@/components/organisms/k/FlashcardGenerator";
import { Sparkles, FileText, SquareSplitVertical } from "lucide-react";

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mt-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Learning Tools</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
            Tạo đề kiểm tra và flashcard{" "}
            <span className="text-primary">từ PDF</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Tải lên tài liệu PDF của bạn và để AI tạo ra các câu hỏi kiểm tra
            hoặc flashcard học tập một cách thông minh và hiệu quả
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20 mt-4">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 p-1 bg-card border border-border">
              <TabsTrigger
                value="test"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Đề kiểm tra</span>
              </TabsTrigger>
              <TabsTrigger
                value="flashcard"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <SquareSplitVertical className="w-4 h-4" />
                <span className="font-medium">Flashcard</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="test" className="mt-0">
                <TestGenerator />
              </TabsContent>

              <TabsContent value="flashcard" className="mt-0">
                <FlashcardGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
