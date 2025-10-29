"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestGenerator } from "@/components/organisms/k/TestGenerator";
import { FlashcardGenerator } from "@/components/organisms/k/FlashcardGenerator";
import { FileText, SquareSplitVertical } from "lucide-react";

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20 mt-4">
        <div className="w-full mx-auto">
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid grid-cols-2 h-12 bg-card border border-border w-full md:w-fit">
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

            <div className="mt-4">
              <TabsContent value="test">
                <TestGenerator />
              </TabsContent>

              <TabsContent value="flashcard">
                <FlashcardGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
