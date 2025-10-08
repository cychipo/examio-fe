"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import FileUpload from "@/components/kokonutui/file-upload";

interface Flashcard {
  front: string;
  back: string;
}

interface GeneratedCards {
  cards: Flashcard[];
}

export function FlashcardGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardCount, setCardCount] = useState([15]);

  const [generatedCards, setGeneratedCards] = useState<GeneratedCards | null>(
    null
  );
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const nextCard = () => {
    if (generatedCards && currentCard < generatedCards.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload & Settings */}
      <FileUpload
        acceptedFileTypes={[".pdf"]}
        maxFileSize={10485760}
        className="w-full h-full"
      />

      {/* Flashcard Preview */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Xem trước flashcard
          </CardTitle>
          <CardDescription>
            Nhấn vào thẻ để lật và xem câu trả lời
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedCards ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo flashcard để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card Counter */}
              <div className="text-center text-sm text-muted-foreground">
                Thẻ {currentCard + 1} / {generatedCards.cards.length}
              </div>

              {/* Flashcard */}
              <div
                className="relative h-80 cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}>
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}>
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden">
                    <div className="w-full h-full p-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-sm font-medium text-primary uppercase tracking-wide">
                          Câu hỏi
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {generatedCards.cards[currentCard].front}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nhấn để xem câu trả lời
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <div className="w-full h-full p-8 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/30 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-sm font-medium text-accent uppercase tracking-wide">
                          Câu trả lời
                        </div>
                        <p className="text-lg text-foreground leading-relaxed">
                          {generatedCards.cards[currentCard].back}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className="flex-1 bg-transparent">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextCard}
                  disabled={currentCard === generatedCards.cards.length - 1}
                  className="flex-1 bg-transparent">
                  Sau
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
