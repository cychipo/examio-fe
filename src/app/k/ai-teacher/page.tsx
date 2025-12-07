"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  User,
  Bot,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAITeacherStore, Message } from "@/stores/useAITeacherStore";
import { RecentFilesList } from "@/components/molecules/RecentFilesList";
import { RecentUpload } from "@/apis/aiApi";

// Check if speech recognition is supported
const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
};

export default function AITeacherPage() {
  const {
    messages,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    selectedUpload,
    setIsListening,
    setTranscript,
    setSelectedUpload,
    sendMessage,
    stopSpeaking,
    clearMessages,
    speakResponse,
  } = useAITeacherStore();

  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check browser support
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());

    // Load voices for TTS
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicPermission("denied");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Don't automatically restart if user stopped
    };

    return recognition;
  }, [setTranscript, setIsListening]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!speechSupported) return;

    // Stop any current speech
    stopSpeaking();

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
      }
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicPermission("denied");
    }
  }, [
    speechSupported,
    stopSpeaking,
    initRecognition,
    setIsListening,
    setTranscript,
  ]);

  // Stop listening and send message
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);

    // Send the transcript as message
    if (transcript.trim()) {
      sendMessage(transcript.trim());
    }
  }, [transcript, sendMessage, setIsListening]);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Handle file selection
  const handleSelectUpload = (upload: RecentUpload) => {
    setSelectedUpload(upload);
  };

  // Replay message with TTS
  const replayMessage = (content: string) => {
    stopSpeaking();
    speakResponse(content);
  };

  if (!speechSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-semibold">
                Trình duyệt không hỗ trợ
              </h2>
              <p className="text-muted-foreground">
                Tính năng Giáo viên AI cần sử dụng Speech Recognition. Vui lòng
                sử dụng Google Chrome hoặc Microsoft Edge để có trải nghiệm tốt
                nhất.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="relative container mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-lg" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              Giáo viên AI
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Trò chuyện bằng giọng nói với AI
            </p>
          </div>
        </div>

        {/* Selected Document Badge */}
        {selectedUpload && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 w-fit">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Đang sử dụng tài liệu:{" "}
              <span className="font-medium">{selectedUpload.filename}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/20"
              onClick={() => setSelectedUpload(null)}>
              ×
            </Button>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Area */}
          <div className="flex-1 min-w-0">
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="p-0">
                {/* Messages Area */}
                <ScrollArea
                  className="h-[400px] md:h-[500px] p-4"
                  ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Xin chào!</p>
                      <p className="text-sm mt-2 max-w-md">
                        Tôi là giáo viên AI của bạn. Nhấn nút mic và bắt đầu nói
                        để đặt câu hỏi. Bạn có thể chọn tài liệu PDF để tôi trả
                        lời dựa trên nội dung.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isSpeaking={isSpeaking}
                          onReplay={() => replayMessage(message.content)}
                        />
                      ))}
                      {isProcessing && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Đang suy nghĩ...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Transcript Preview */}
                {isListening && transcript && (
                  <div className="px-4 py-2 border-t border-white/10 bg-primary/5">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">
                        Đang nghe:{" "}
                      </span>
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center justify-center gap-4">
                    {/* Mic Button */}
                    <Button
                      size="lg"
                      onClick={toggleListening}
                      disabled={isProcessing || micPermission === "denied"}
                      className={cn(
                        "w-16 h-16 rounded-full transition-all duration-300",
                        isListening
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-primary hover:bg-primary/90"
                      )}>
                      {isListening ? (
                        <MicOff className="w-6 h-6" />
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </Button>

                    {/* Stop Speaking Button */}
                    {isSpeaking && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={stopSpeaking}
                        className="w-14 h-14 rounded-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                        <VolumeX className="w-5 h-5" />
                      </Button>
                    )}

                    {/* Clear Chat Button */}
                    {messages.length > 0 && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={clearMessages}
                        className="w-14 h-14 rounded-full border-white/20 hover:bg-white/5">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  {/* Status Text */}
                  <div className="text-center mt-3">
                    {micPermission === "denied" ? (
                      <p className="text-sm text-destructive">
                        Vui lòng cho phép truy cập microphone
                      </p>
                    ) : isListening ? (
                      <p className="text-sm text-primary animate-pulse">
                        Đang nghe... Nhấn lại để gửi
                      </p>
                    ) : isProcessing ? (
                      <p className="text-sm text-muted-foreground">
                        Đang xử lý...
                      </p>
                    ) : isSpeaking ? (
                      <p className="text-sm text-orange-400">
                        <Volume2 className="w-4 h-4 inline-block mr-1" />
                        Đang đọc...
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nhấn mic để bắt đầu nói
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Files */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl lg:sticky lg:top-6">
              <CardContent className="pt-4">
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Chọn tài liệu tham khảo
                  </h3>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    AI sẽ trả lời dựa trên nội dung tài liệu
                  </p>
                </div>
                <RecentFilesList onSelectUpload={handleSelectUpload} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  isSpeaking,
  onReplay,
}: {
  message: Message;
  isSpeaking: boolean;
  onReplay: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary/20" : "bg-purple-500/20"
        )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "flex flex-col items-end"
        )}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-white/5 border border-white/10 rounded-tl-sm"
          )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 text-xs text-muted-foreground hover:text-primary"
            onClick={onReplay}
            disabled={isSpeaking}>
            <Volume2 className="w-3 h-3 mr-1" />
            Đọc lại
          </Button>
        )}
      </div>
    </div>
  );
}
