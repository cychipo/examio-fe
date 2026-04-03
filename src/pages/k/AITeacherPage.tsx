import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  FileText,
  Loader2,
  AlertCircle,
  Square,
  ArrowLeft,
  GraduationCap,
  Trash2,
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
  Flag,
} from "lucide-react";
import { useAITeacherStore } from "@/stores/useAITeacherStore";
import { ChatInputBar } from "@/components/molecules/ChatInputBar";
import { ChatHistoryCard } from "@/components/molecules/ChatHistoryCard";
import { RecentFilesModal } from "@/components/organisms/RecentFilesModal";
import { SubjectSelector } from "@/components/organisms/SubjectSelector";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import type { RecentUpload } from "@/apis/aiApi";
import type { AIChatMessage } from "@/apis/aiChatApi";
import type { Subject } from "@/apis/subjectApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useAuthStore } from "@/stores/useAuthStore";
import { ModelSelector } from "@/components/atoms/ModelSelector";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
};

const iconMap = {
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Flag,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
} as const;

function renderIcon(iconName: string | null | undefined, className?: string) {
  if (!iconName) return null;

  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
}

export default function AITeacherPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    selectedSubject,
    fetchCategories,
    startChatWithSubject,
    chats,
    isLoadingChats,
    selectedChatId,
    messages,
    isLoadingMessages,
    streamingContent,
    isStreaming,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    selectedUploads,
    uploadedImageUrl,
    isUploadingImage,
    isProcessingPdf,
    fetchChats,
    selectChat,
    updateChatTitle,
    deleteChat,
    clearChatWithFiles,
    sendMessage,
    checkAndLoadChatFromUrl,
    setIsListening,
    setTranscript,
    addSelectedUpload,
    removeSelectedUpload,
    setUploadedImageUrl,
    uploadImage,
    uploadPdf,
    speakResponse,
    stopSpeaking,
    abortStream,
    selectedModel,
    setSelectedModel,
  } = useAITeacherStore();

  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [recentFilesModalOpen, setRecentFilesModalOpen] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role === "teacher") {
      navigate("/k", { replace: true });
      return;
    }

    setSpeechSupported(isSpeechRecognitionSupported());
    fetchChats();
    fetchCategories();
    checkAndLoadChatFromUrl();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [fetchChats, fetchCategories, checkAndLoadChatFromUrl, user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, streamingContent, isProcessing, isProcessingPdf]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStreaming || isProcessing) {
        e.preventDefault();
        e.returnValue = "Đang trả lời. Bạn có chắc muốn rời đi?";
        return "Đang trả lời. Bạn có chắc muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStreaming, isProcessing]);

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

    return recognition;
  }, [setTranscript, setIsListening]);

  const startListening = useCallback(async () => {
    if (!speechSupported) return;
    stopSpeaking();

    try {
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

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [setIsListening]);

  const handleSendMessage = (message: string, fromMic = false) => {
    if (isListening) {
      stopListening();
      fromMic = true;
    }
    sendMessage(message, fromMic);
  };

  const handleSelectRecentFile = (file: RecentUpload) => {
    if (!selectedUploads.some((u) => u.id === file.id)) {
      addSelectedUpload(file);
    }
  };

  const handleUploadImage = async (file: File) => {
    await uploadImage(file);
  };

  const handlePdfUpload = () => {
    pdfInputRef.current?.click();
  };

  const replayMessage = (content: string) => {
    stopSpeaking();
    speakResponse(content);
  };

  const handleSelectSubject = (subject: Subject) => {
    startChatWithSubject(subject);
    setShowSubjectSelector(false);
  };

  const handleCreateNewChat = () => {
    setShowSubjectSelector(true);
    selectChat(null);
  };

  const handleBackToChat = () => {
    setShowSubjectSelector(false);
  };

  const handleClearChat = () => {
    if (selectedChatId) {
      const hasFiles = selectedUploads.length > 0;
      if (hasFiles) {
        setClearChatDialogOpen(true);
      } else {
        clearChatWithFiles(selectedChatId, false);
      }
    }
  };

  const handleConfirmClearWithFiles = () => {
    if (selectedChatId) {
      clearChatWithFiles(selectedChatId, true);
      setClearChatDialogOpen(false);
    }
  };

  const handleConfirmClearWithoutFiles = () => {
    if (selectedChatId) {
      clearChatWithFiles(selectedChatId, false);
      setClearChatDialogOpen(false);
    }
  };

  if (!speechSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-semibold">Trình duyệt không hỗ trợ</h2>
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

  if (showSubjectSelector || (!selectedChatId && !selectedSubject)) {
    return (
      <div className="relative mx-auto min-h-screen max-w-7xl overflow-hidden">
        <section className="relative container mx-auto px-4 pb-4 pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedChatId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToChat}
                  className="mr-2"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Quay lại
                </Button>
              )}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 blur-lg" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-2xl font-bold md:text-3xl">
                  Chọn Giáo viên AI
                </h1>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Mỗi giáo viên chuyên về một môn học
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative container mx-auto px-4 pb-8">
          <Card className="border-border bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-6">
              <SubjectSelector
                onSelectSubject={handleSelectSubject}
                selectedSubjectId={selectedSubject?.id}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-7xl overflow-hidden">
      <input
        ref={pdfInputRef}
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            uploadPdf(files);
          }
          e.target.value = "";
        }}
      />

      <section className="relative container mx-auto px-4 pb-4 pt-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 blur-lg" />
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border"
                style={{
                  backgroundColor: selectedSubject?.color
                    ? `${selectedSubject.color}20`
                    : "rgba(var(--primary), 0.1)",
                }}
              >
                {renderIcon(selectedSubject?.icon, "h-7 w-7 text-primary") || (
                  <Bot className="h-7 w-7 text-primary" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-2xl font-bold md:text-3xl">
                  {selectedSubject?.name || "Giáo viên AI"}
                </h1>
                {selectedSubject && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={handleCreateNewChat}
                  >
                    Đổi môn
                  </Badge>
                )}
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                {selectedSubject
                  ? "Chỉ trả lời trong phạm vi môn này"
                  : "Trò chuyện thông minh với AI"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedChatId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isProcessing || isStreaming}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa chat
              </Button>
            )}
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={isProcessing || isStreaming}
            />
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-6">
              <ChatHistoryCard
                chats={chats}
                selectedChatId={selectedChatId}
                isLoading={isLoadingChats}
                onSelectChat={(chatId) => selectChat(chatId, true, true)}
                onCreateChat={handleCreateNewChat}
                onRenameChat={updateChatTitle}
                onDeleteChat={deleteChat}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <Card className="border-border bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="p-0">
                <ScrollArea className="h-[450px] p-4 md:h-[500px]" ref={scrollRef}>
                  {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <div
                        className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: selectedSubject?.color
                            ? `${selectedSubject.color}20`
                            : "rgba(var(--primary), 0.1)",
                        }}
                      >
                        {renderIcon(selectedSubject?.icon, "h-10 w-10 opacity-50") || (
                          <Bot className="h-10 w-10 opacity-50" />
                        )}
                      </div>
                      <p className="text-lg font-medium">
                        Xin chào! Tôi là giáo viên {selectedSubject?.name || "AI"}
                      </p>
                      <p className="mt-2 max-w-md text-sm">
                        {selectedSubject
                          ? `Hãy đặt câu hỏi về ${selectedSubject.name} và tôi sẽ giúp bạn!`
                          : "Hãy nhập tin nhắn hoặc nhấn mic để bắt đầu cuộc trò chuyện."}
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
                          subjectIcon={selectedSubject?.icon}
                          subjectColor={selectedSubject?.color}
                        />
                      ))}
                      {isStreaming && streamingContent && (
                        <div className="flex gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: selectedSubject?.color
                                ? `${selectedSubject.color}20`
                                : "rgba(var(--primary), 0.2)",
                            }}
                          >
                            {renderIcon(selectedSubject?.icon, "h-4 w-4 text-primary") || (
                              <Bot className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-black/5 px-4 py-3">
                            <p className="whitespace-pre-wrap text-sm">{streamingContent}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">Đang trả lời...</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => abortStream?.()}
                              >
                                <Square className="mr-1 h-3 w-3 fill-current" />
                                Dừng
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {isProcessing && !streamingContent && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: selectedSubject?.color
                                  ? `${selectedSubject.color}20`
                                  : "rgba(var(--primary), 0.2)",
                              }}
                            >
                              {renderIcon(selectedSubject?.icon, "h-4 w-4 text-primary") || (
                                <Bot className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Đang suy nghĩ...</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => abortStream?.()}
                          >
                            <Square className="mr-1 h-3 w-3 fill-current" />
                            Dừng
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {isListening && transcript && (
                  <div className="border-t border-border bg-primary/5 px-4 py-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Đang nghe: </span>
                      {transcript}
                    </p>
                  </div>
                )}

                <div className="border-t border-border p-4">
                  {selectedUploads.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {selectedUploads.map((file) => (
                        <div
                          key={file.id}
                          className="animate-in fade-in zoom-in flex w-fit items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 duration-200"
                        >
                          <FileText className="h-4 w-4 text-red-400" />
                          <span className="max-w-[200px] truncate text-sm text-red-300/90">
                            {file.filename}
                          </span>
                          {file.id.startsWith("processing-") ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-red-400 hover:bg-primary/20"
                              onClick={() => removeSelectedUpload(file.id)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <ChatInputBar
                    onSendMessage={handleSendMessage}
                    onStartListening={startListening}
                    onStopListening={stopListening}
                    onUploadImage={handleUploadImage}
                    onUploadPdf={handlePdfUpload}
                    onSelectRecentFile={() => setRecentFilesModalOpen(true)}
                    isListening={isListening}
                    isProcessing={isProcessing}
                    isUploadingImage={isUploadingImage}
                    isUploadingPdf={isProcessingPdf}
                    transcript={transcript}
                    uploadedImageUrl={uploadedImageUrl}
                    onClearImage={() => setUploadedImageUrl(null)}
                    disabled={micPermission === "denied"}
                  />

                  <div className="mt-3 text-center">
                    {micPermission === "denied" ? (
                      <p className="text-sm text-destructive">
                        Vui lòng cho phép truy cập microphone
                      </p>
                    ) : isListening ? (
                      <p className="animate-pulse text-sm text-primary">
                        Đang nghe... Nhấn lại mic hoặc Enter để gửi
                      </p>
                    ) : isProcessing ? (
                      <p className="text-sm text-muted-foreground">Đang xử lý...</p>
                    ) : isSpeaking ? (
                      <p className="flex items-center justify-center gap-1 text-sm text-orange-400">
                        <Volume2 className="h-4 w-4" />
                        Đang đọc...
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 px-2"
                          onClick={stopSpeaking}
                        >
                          <VolumeX className="mr-1 h-4 w-4" />
                          Dừng
                        </Button>
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:hidden">
            <ChatHistoryCard
              chats={chats}
              selectedChatId={selectedChatId}
              isLoading={isLoadingChats}
              onSelectChat={(chatId) => selectChat(chatId, true, true)}
              onCreateChat={handleCreateNewChat}
              onRenameChat={updateChatTitle}
              onDeleteChat={deleteChat}
            />
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={clearChatDialogOpen}
        onOpenChange={setClearChatDialogOpen}
        title="Xóa cuộc trò chuyện"
        description={
          selectedUploads.length > 0
            ? `Cuộc trò chuyện này có ${selectedUploads.length} file PDF. Bạn có muốn xóa luôn các file này không?`
            : "Bạn có chắc muốn xóa cuộc trò chuyện này không?"
        }
        confirmText={selectedUploads.length > 0 ? "Xóa chat và files" : "Xóa chat"}
        cancelText={selectedUploads.length > 0 ? "Chỉ xóa chat" : "Hủy"}
        onConfirm={
          selectedUploads.length > 0
            ? handleConfirmClearWithFiles
            : handleConfirmClearWithoutFiles
        }
        onCancel={
          selectedUploads.length > 0
            ? handleConfirmClearWithoutFiles
            : () => setClearChatDialogOpen(false)
        }
        variant={selectedUploads.length > 0 ? "destructive" : "default"}
      />

      <RecentFilesModal
        open={recentFilesModalOpen}
        onOpenChange={setRecentFilesModalOpen}
        onSelectFile={handleSelectRecentFile}
        selectedFileId={undefined}
        includeHistory={false}
      />
    </div>
  );
}

function MessageBubble({
  message,
  isSpeaking,
  onReplay,
  subjectIcon,
  subjectColor,
}: {
  message: AIChatMessage;
  isSpeaking: boolean;
  onReplay: () => void;
  subjectIcon?: string | null;
  subjectColor?: string | null;
}) {
  const isUser = message.role === "user";
  const { user } = useAuthStore();

  return (
    <div className={cn("group flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isUser
            ? "rgba(var(--primary), 0.2)"
            : subjectColor
              ? `${subjectColor}20`
              : "rgba(168, 85, 247, 0.2)",
        }}
      >
        {isUser ? (
          <img
            src={user?.avatar || "/avt-default.webp"}
            alt="User"
            className="h-8 w-8 rounded-full"
          />
        ) : renderIcon(subjectIcon, "h-4 w-4 text-yellow-400") || (
          <Bot className="h-4 w-4 text-yellow-400" />
        )}
      </div>
      <div className={cn("max-w-[80%] flex-1", isUser && "flex flex-col items-end")}>
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Attached"
              className="max-w-[200px] rounded-lg border border-border"
            />
          </div>
        )}

        {message.documentName && (
          <div className="mb-2">
            <div className="flex w-fit items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
              <FileText className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-300/80">{message.documentName}</span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-black/5",
          )}
        >
          <div className="prose max-w-none text-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {!isUser && (
          <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary"
              onClick={onReplay}
              disabled={isSpeaking}
            >
              <Volume2 className="mr-1 h-3 w-3" />
              Đọc lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
