"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Code2,
  Copy,
  Database,
  Gauge,
  Loader2,
  MessageSquarePlus,
  Pencil,
  SendHorizonal,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ModelSelector } from "@/components/atoms/ModelSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAIStudentStore } from "@/stores/useAIStudentStore";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const quickPromptGroups = [
  {
    title: "Giải thích",
    prompts: [
      "Giải thích cho mình thuật toán binary search bằng Python thật dễ hiểu.",
      "So sánh vòng lặp for và while trong C và Python khi nào nên dùng.",
    ],
  },
  {
    title: "Debug",
    prompts: [
      "Tìm lỗi trong đoạn code C bị segmentation fault khi duyệt mảng.",
      "Giải thích vì sao chương trình Python này bị lỗi IndexError và cách sửa.",
    ],
  },
  {
    title: "Lời giải",
    prompts: [
      "Viết lời giải Python cho bài đọc N số và in ra số lớn nhất, kèm giải thích độ phức tạp.",
      "Hướng dẫn từng bước cách giải bài kiểm tra số nguyên tố bằng C mà chưa đưa full code ngay.",
    ],
  },
];

function getSourceBadgeLabel(sourcePath: string) {
  const normalized = sourcePath.toLowerCase();
  if (normalized.includes("humaneval")) return "HumanEval";
  if (normalized.includes("mbpp")) return "MBPP";
  if (normalized.includes("codenet")) return "CodeNet";
  return "Knowledge";
}

function getShortSourceName(sourcePath: string, fallbackTitle: string) {
  const segments = sourcePath.split("/").filter(Boolean);
  return segments[segments.length - 1] || fallbackTitle;
}

export default function AIStudentPage() {
  const { user, initializing } = useAuthStore();
  const {
    sessions,
    selectedSessionId,
    messages,
    selectedModel,
    isSending,
    streamingContent,
    initialize,
    setSelectedModel,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
    sendMessage,
    clearMessages,
    evaluateMessage,
    stopStreaming,
  } = useAIStudentStore();
  const [input, setInput] = useState("");
  const [visibleMessageCount, setVisibleMessageCount] = useState(20);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const canAccess = useMemo(
    () => !initializing && user?.role === "student",
    [initializing, user],
  );
  const visibleMessages = useMemo(
    () => messages.slice(-visibleMessageCount),
    [messages, visibleMessageCount],
  );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    setVisibleMessageCount(20);
  }, [selectedSessionId]);

  const handleSubmit = async () => {
    if (!input.trim() || isSending) {
      return;
    }
    const content = input;
    setInput("");
    await sendMessage(content);
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Đã copy nội dung");
  };

  const handleRenameSession = async (
    sessionId: string,
    currentTitle: string,
  ) => {
    setRenameDialog({ id: sessionId, title: currentTitle });
    setRenameValue(currentTitle);
  };

  const handleConfirmRename = async () => {
    if (!renameDialog || !renameValue.trim()) {
      return;
    }

    setIsRenaming(true);
    try {
      await renameSession(renameDialog.id, renameValue.trim());
      toast.success("Đã cập nhật tên phiên chat");
      setRenameDialog(null);
      setRenameValue("");
    } finally {
      setIsRenaming(false);
    }
  };

  const markdownComponents = {
    code: ({ className, children, ...props }: any) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="rounded-md bg-[#f3efe7] px-1.5 py-0.5 font-mono text-[0.92em] text-[#9a3412]"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code
          className="font-mono text-[13px] leading-6 text-[#f8fafc]"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => (
      <div className="relative my-4 overflow-hidden rounded-3xl border border-[#2b3445] bg-[#0b1220] shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(90deg,rgba(30,41,59,0.96),rgba(15,23,42,0.88))] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </div>
            <div className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#cbd5e1]">
              {children?.props?.className?.replace("language-", "") || "code"}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full border border-white/10 bg-white/5 px-3 text-[#e2e8f0] hover:bg-white/10 hover:text-white"
            onClick={() => {
              const codeContent =
                typeof children?.props?.children === "string"
                  ? children.props.children
                  : Array.isArray(children?.props?.children)
                    ? children.props.children.join("")
                    : "";
              void handleCopy(codeContent);
            }}
          >
            <Copy className="h-4 w-4" />
            Copy code
          </Button>
        </div>
        <div className="overflow-x-auto px-4 py-4">
          <pre className="m-0 overflow-x-auto bg-transparent p-0 font-mono text-[13px] leading-6 text-[#f8fafc]">
            {children}
          </pre>
        </div>
      </div>
    ),
  };

  if (initializing) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="p-6 text-sm text-destructive">
        Trang này chỉ dành cho học sinh.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(227,24,55,0.08),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent)] p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/80 backdrop-blur-sm xl:sticky xl:top-20 xl:h-[calc(100vh-7rem)] xl:overflow-hidden sticky top-0">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Hỏi Lập Trình</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Trợ lý học tập cho học sinh với C, Python và thuật toán.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
              Hỏi về debug, giải thuật, cấu trúc dữ liệu, giải thích code hoặc
              nhờ gợi ý từng bước cho bài tập lập trình. Hệ thống sẽ tự truy
              xuất tri thức gần nhất từ kho knowledge và GraphRAG trước khi trả
              lời.
            </div>
          </CardHeader>
          <CardContent className="space-y-4 xl:h-[calc(100%-8rem)] xl:overflow-y-auto">
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Prompt nhanh
                </p>
                <Button variant="ghost" size="sm" onClick={clearMessages}>
                  <Trash2 className="h-4 w-4" />
                  Làm mới chat
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => createSession()}
              >
                <MessageSquarePlus className="h-4 w-4" />
                Tạo phiên chat mới
              </Button>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Phiên trò chuyện
                </p>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-3 py-2",
                        selectedSessionId === session.id
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-black/[0.03]",
                      )}
                    >
                      <button
                        type="button"
                        className="flex-1 text-left text-sm"
                        onClick={() => selectSession(session.id)}
                      >
                        <p className="truncate font-medium">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.updatedAt).toLocaleString()}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRenameSession(session.id, session.title)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {sessions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSessionToDelete({
                              id: session.id,
                              title: session.title,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {quickPromptGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {group.title}
                    </p>
                    {group.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="w-full rounded-2xl border border-border/70 bg-black/[0.03] px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5 text-primary" />
                  Hỏi đáp lập trình
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI sẽ trả lời theo ngữ cảnh dữ liệu đã ingest và kiến thức lập
                  trình hiện có.
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Student Mode
                </div>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-[76vh] min-w-0 flex-col p-0">
            <ScrollArea className="flex-1 px-4 py-5 md:px-6">
              <div className="space-y-4">
                {messages.length > visibleMessages.length && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisibleMessageCount((current) => current + 20)
                      }
                    >
                      Xem thêm tin nhắn cũ
                    </Button>
                  </div>
                )}
                {visibleMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "min-w-0 w-full max-w-[96%] overflow-hidden rounded-[28px] px-4 py-4 text-sm shadow-sm lg:max-w-[88%] xl:max-w-[80%]",
                        message.role === "user"
                          ? "bg-[linear-gradient(135deg,#fb7185,#f97316)] text-white"
                          : "border border-[#e8dfd0] bg-[linear-gradient(180deg,#fffdfa,#fff6ea)] text-foreground shadow-[0_16px_45px_rgba(217,119,6,0.08)]",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none text-[#3f3b32] prose-p:leading-7 prose-headings:text-[#171717] prose-strong:text-[#111827] prose-code:before:hidden prose-code:after:hidden">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}

                      {message.role === "assistant" && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => evaluateMessage(message.id)}
                            disabled={message.isEvaluating}
                            className="rounded-full border border-[#eed8bd] bg-white/80 text-[#7c5b37] hover:bg-[#fff4e8]"
                          >
                            {message.isEvaluating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Gauge className="h-4 w-4" />
                            )}
                            {message.isEvaluating ? "Đang chấm..." : "Tính tín nhiệm"}
                          </Button>
                        </div>
                      )}

                      {message.role === "assistant" && message.isEvaluating && (
                        <div className="mt-4 rounded-[24px] border border-[#ecd7bd] bg-[linear-gradient(180deg,#fffdf8,#fff5e8)] px-4 py-4 shadow-[0_14px_35px_rgba(217,119,6,0.08)]">
                          <div className="flex items-center gap-3 text-sm text-[#6f573d]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                              <Loader2 className="h-4 w-4 animate-spin text-[#f97316]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#3f3b32]">
                                Đang chấm độ tín nhiệm câu trả lời
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Hệ thống đang sinh test, chạy sandbox và tổng hợp kết quả ở backend.
                              </p>
                              {message.evaluationJob?.status && (
                                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#a16207]">
                                  {message.evaluationJob.status}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {message.role === "assistant" && message.evaluation && (
                        <div className="mt-4 overflow-hidden rounded-[24px] border border-[#ecd7bd] bg-[linear-gradient(180deg,#fffdf8,#fff5e8)] shadow-[0_14px_35px_rgba(217,119,6,0.08)]">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1dfca] px-4 py-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6b37]">
                                Đánh giá độ tín nhiệm
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Chấm bằng bộ test động sinh từ chính câu hỏi lập trình.
                              </p>
                            </div>
                            <div className="rounded-full bg-[linear-gradient(135deg,#fb923c,#f97316)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.25)]">
                              {message.evaluation.score}/100
                            </div>
                          </div>

                          <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div className="space-y-3">
                              {message.evaluation.status === "unavailable" && (
                                <div className="rounded-2xl border border-dashed border-[#efc78a] bg-[linear-gradient(180deg,#fff8ef,#fff2df)] px-4 py-3 text-sm text-[#6f573d]">
                                  <p className="font-semibold text-[#8a5a20]">
                                    Chưa có dữ liệu để đánh giá tự động
                                  </p>
                                  <p className="mt-1 text-xs leading-6 text-[#7b6b59]">
                                    Câu trả lời này hiện chưa match được với bộ benchmark chuẩn trong hệ thống, nên Examio chưa thể chấm điểm một cách xác định.
                                  </p>
                                </div>
                              )}

                              <div className="grid gap-2 sm:grid-cols-3">
                                <div className="rounded-2xl border border-[#efdfc7] bg-white/80 px-3 py-3">
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9a6b37]">
                                    Kết quả
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-[#3f3b32]">
                                    {message.evaluation.total > 0
                                      ? `${message.evaluation.passed}/${message.evaluation.total} test`
                                      : "Chưa chấm được"}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-[#efdfc7] bg-white/80 px-3 py-3">
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9a6b37]">
                                    Ngôn ngữ
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-[#3f3b32]">
                                    {message.evaluation.language.toUpperCase()}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-[#efdfc7] bg-white/80 px-3 py-3">
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9a6b37]">
                                    Thời gian
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-[#3f3b32]">
                                    {Math.round(message.evaluation.executionTimeMs)} ms
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#efdfc7] bg-white/80 px-4 py-3 text-sm text-[#4b463d]">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6b37]">
                                  Nhận định
                                </p>
                                <p>{message.evaluation.rationale}</p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#efdfc7] bg-[#fffaf2] px-4 py-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6b37]">
                                Trạng thái thực thi
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-[#e6d7c3] bg-white/80 text-[#6b4f32]">
                                  {message.evaluation.status}
                                </Badge>
                                {message.evaluation.modelUsed && (
                                  <Badge variant="outline" className="border-[#e6d7c3] bg-white/80 text-[#6b4f32]">
                                    {message.evaluation.modelUsed}
                                  </Badge>
                                )}
                              </div>
                              {message.evaluation.stderr && (
                                <div className="mt-3 rounded-2xl bg-[#221815] px-3 py-3 font-mono text-xs leading-5 text-[#fde68a]">
                                  {message.evaluation.stderr}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {message.role === "assistant" &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-[#eadfce] pt-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {typeof message.confidence === "number" && (
                                <Badge
                                  variant="outline"
                                  className="border-[#e6d7c3] bg-white/80 text-[#3f3b32]"
                                >
                                  Confidence{" "}
                                  {Math.round(message.confidence * 100)}%
                                </Badge>
                              )}
                              {message.modelUsed && (
                                <Badge
                                  variant="outline"
                                  className="border-[#e6d7c3] bg-white/80 text-[#3f3b32]"
                                >
                                  {message.modelUsed}
                                </Badge>
                              )}
                            </div>
                            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                              {message.sources.slice(0, 3).map((source) => (
                                <div
                                  key={source.chunkId}
                                  className="min-w-0 rounded-2xl border border-[#eadfce] bg-white/85 px-3 py-3 text-xs text-muted-foreground"
                                >
                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="truncate font-medium text-foreground">
                                      {getShortSourceName(source.sourcePath, source.title)}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="border-[#e6d7c3] bg-white/80 text-[#6b4f32]"
                                    >
                                      {getSourceBadgeLabel(source.sourcePath)}
                                    </Badge>
                                  </div>
                                  <p className="line-clamp-2 text-[11px] leading-5 text-[#7b7368]">
                                    {source.title}
                                  </p>
                                  <p className="mt-2">
                                    score: {source.similarityScore.toFixed(3)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="inline-flex min-w-0 w-full max-w-[96%] overflow-hidden rounded-[28px] border border-[#e8dfd0] bg-[linear-gradient(180deg,#fffdfa,#fff6ea)] px-4 py-4 text-sm text-muted-foreground shadow-[0_16px_45px_rgba(217,119,6,0.08)] lg:max-w-[88%] xl:max-w-[80%]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {streamingContent
                            ? "AI đang trả lời..."
                            : "AI đang suy nghĩ..."}
                        </div>
                        {streamingContent && (
                          <div className="prose prose-sm max-w-none text-[#3f3b32] prose-p:leading-7 prose-headings:text-[#171717] prose-strong:text-[#111827] prose-code:before:hidden prose-code:after:hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {streamingContent}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className="flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={stopStreaming}
                          >
                            <Square className="h-4 w-4" />
                            Dừng
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 px-4 py-4 md:px-6">
              <div className="rounded-[32px] border border-[#eedfce] bg-[linear-gradient(180deg,#fffaf3,#fff4e7)] p-3 shadow-[0_18px_60px_rgba(217,119,6,0.08)]">
                <div className="mb-3 flex flex-col gap-3 border-b border-[#eedfce] px-2 pb-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f4d]">
                      Mô hình AI
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chọn mô hình AI của hệ thống sẽ sử dụng để trả lời câu hỏi
                      của bạn.
                    </p>
                  </div>
                  <ModelSelector
                    value={selectedModel}
                    onChange={setSelectedModel}
                    disabled={isSending}
                    size="sm"
                    className="w-full lg:w-auto"
                  />
                </div>
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Hỏi về code, lỗi lập trình, thuật toán hoặc dán đoạn code cần giải thích..."
                  className="min-h-[140px] resize-none rounded-[24px] border border-[#f0e1cf] bg-white/80 p-4 shadow-none focus-visible:ring-0"
                />
                <div className="mt-3 flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-between">
                  <div className="grid gap-2 text-xs text-muted-foreground lg:max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-[#e6d7c3] bg-white/80 text-[#6b4f32]"
                      >
                        <div className="flex items-center gap-1">
                          <Database className="mr-1 h-3.5 w-3.5" />
                          <p>Hybrid retrieval + GraphRAG</p>
                        </div>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-[#e6d7c3] bg-white/80 text-[#6b4f32] "
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles className="mr-1 h-3.5 w-3.5" />
                          <p>Model: {selectedModel}</p>
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSending || !input.trim()}
                    className="h-11 rounded-full bg-[linear-gradient(135deg,#fb7185,#f97316)] px-6 text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] hover:opacity-95"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
                    Gửi câu hỏi
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={Boolean(sessionToDelete)}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xóa phiên chat "{sessionToDelete?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa toàn bộ lịch sử tin nhắn của phiên chat trên
              hệ thống và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!sessionToDelete) return;
                await deleteSession(sessionToDelete.id);
                toast.success("Đã xóa phiên chat");
                setSessionToDelete(null);
              }}
            >
              Xóa phiên chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(renameDialog)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameDialog(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent className="border-[#eddcc6] bg-[linear-gradient(180deg,#fffaf4,#fff6eb)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi tên phiên chat</DialogTitle>
            <DialogDescription>
              Đặt lại tên để bạn dễ tìm lại cuộc trò chuyện này sau.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#ecdcc8] bg-white/80 p-3 text-xs text-muted-foreground">
              Tên mặc định của phiên mới sẽ là `Đoạn chat mới`. Sau câu hỏi đầu
              tiên, hệ thống tự lấy 5 từ đầu để đặt tiêu đề.
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="rename-session-input"
              >
                Tên phiên chat
              </label>
              <Input
                id="rename-session-input"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                placeholder="Ví dụ: Debug binary search Python"
                maxLength={80}
                className="border-[#ead8c2] bg-white"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleConfirmRename();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialog(null);
                setRenameValue("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmRename}
              disabled={isRenaming || !renameValue.trim()}
              className="bg-[linear-gradient(135deg,#fb7185,#f97316)] text-white hover:opacity-95"
            >
              {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lưu tên mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
