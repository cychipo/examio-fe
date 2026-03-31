import { create } from "zustand";

import {
  aiStudentApi,
  AIStudentEvaluationResult,
  AIStudentMessage,
  AIStudentQueryResponse,
  AIStudentSession,
  AIStudentStreamDonePayload,
} from "@/apis/aiStudentApi";
import { toast } from "@/components/ui/toast";
import { useAIModelCatalogStore } from "@/stores/useAIModelCatalogStore";
import { AIModelType, DEFAULT_AI_MODEL } from "@/types/ai";

export interface AIStudentChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
  sources?: AIStudentQueryResponse["sources"];
  confidence?: number;
  modelUsed?: string;
  evaluation?: AIStudentEvaluationResult;
  evaluationJob?: {
    id: string;
    status: string;
    score?: number;
  };
  isEvaluating?: boolean;
}

interface AIStudentState {
  sessions: AIStudentSession[];
  selectedSessionId: string | null;
  messages: AIStudentChatMessage[];
  selectedModel: AIModelType;
  isSending: boolean;
  streamingContent: string;
  abortStream: (() => void) | null;
  initialize: () => Promise<void>;
  setSelectedModel: (model: AIModelType) => void;
  createSession: (seedPrompt?: string) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  evaluateMessage: (messageId: string) => Promise<void>;
  stopStreaming: () => void;
}

const STUDENT_TUTOR_TOP_K = 2;

function shouldUseFastMode(query: string, selectedModel: AIModelType) {
  const normalized = query.trim().toLowerCase();
  if (selectedModel === "qwen3_32b" && normalized.length > 120) {
    return false;
  }

  if (normalized.length <= 260) {
    return true;
  }

  return ["lỗi", "error", "debug", "fix", "bug", "indexerror", "typeerror", "syntaxerror"].some(keyword => normalized.includes(keyword));
}

function createLocalMessage(
  role: "assistant" | "user",
  content: string,
  extra?: Partial<AIStudentChatMessage>,
): AIStudentChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

function getFallbackMessages() {
  return [
    createLocalMessage(
      "assistant",
      "Xin chào! Mình là trợ lý AI hỗ trợ học lập trình. Bạn có thể hỏi về Python, C++, thuật toán, debug, độ phức tạp hoặc gửi đoạn code để mình giải thích.",
    ),
  ];
}

function isPlaceholderSession(session?: AIStudentSession | null) {
  if (!session) {
    return false;
  }

  const messageCount = session.messageCount ?? 0;
  const lastMessage = session.lastMessage?.trim();

  return messageCount === 0 && !lastMessage;
}

function buildSessionTitleFromPrompt(prompt: string) {
  return prompt
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ")
    .slice(0, 80);
}

function extractAssistantPayload(
  streamedAnswer: string,
  donePayload?: AIStudentStreamDonePayload,
) {
  return {
    content:
      donePayload?.assistantMessage?.content?.trim()
      || streamedAnswer.trim(),
    sources: donePayload?.sources,
    confidence: donePayload?.confidence,
    modelUsed: donePayload?.modelUsed,
  };
}

export const useAIStudentStore = create<AIStudentState>((set, get) => ({
  sessions: [],
  selectedSessionId: null,
  messages: getFallbackMessages(),
  selectedModel: DEFAULT_AI_MODEL,
  isSending: false,
  streamingContent: "",
  abortStream: null,

  initialize: async () => {
    try {
      const catalog = await useAIModelCatalogStore.getState().fetchModels();
      const sessions = await aiStudentApi.listSessions();
      if (sessions.length === 0) {
        const created = await aiStudentApi.createSession();
        const messages = await aiStudentApi.listMessages(created.id);
        set({
          sessions: [created],
          selectedSessionId: created.id,
          messages: messages.length > 0 ? messages : getFallbackMessages(),
          selectedModel: catalog.defaultGenerationModel || DEFAULT_AI_MODEL,
        });
        return;
      }

      const selectedSessionId = sessions[0].id;
      const messages = await aiStudentApi.listMessages(selectedSessionId);
      set({
        sessions,
        selectedSessionId,
        messages: messages.length > 0 ? messages : getFallbackMessages(),
        selectedModel: catalog.defaultGenerationModel || DEFAULT_AI_MODEL,
      });
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể tải lịch sử chat lập trình");
    }
  },

  setSelectedModel: (selectedModel) => {
    set({ selectedModel });
  },

  createSession: async (seedPrompt) => {
    const state = get();
    const currentSession = state.sessions.find(session => session.id === state.selectedSessionId) || null;

    if (isPlaceholderSession(currentSession)) {
      set({
        selectedSessionId: currentSession?.id || null,
        messages: getFallbackMessages(),
        streamingContent: "",
        abortStream: null,
      });
      return;
    }

    const session = await aiStudentApi.createSession(seedPrompt?.slice(0, 48) || "Đoạn chat mới");
    set((state) => ({
      sessions: [session, ...state.sessions],
      selectedSessionId: session.id,
      messages: getFallbackMessages(),
      streamingContent: "",
      abortStream: null,
    }));
  },

  selectSession: async (sessionId) => {
    const messages = await aiStudentApi.listMessages(sessionId);
    set({ selectedSessionId: sessionId, messages: messages.length > 0 ? messages : getFallbackMessages(), streamingContent: "", abortStream: null });
  },

  renameSession: async (sessionId, title) => {
    const updated = await aiStudentApi.updateSession(sessionId, title);
    set((state) => ({
      sessions: state.sessions.map(session => session.id === sessionId ? updated : session),
    }));
  },

  deleteSession: async (sessionId) => {
    await aiStudentApi.deleteSession(sessionId);
    const remaining = get().sessions.filter(session => session.id !== sessionId);
    if (remaining.length === 0) {
      const created = await aiStudentApi.createSession();
      set({ sessions: [created], selectedSessionId: created.id, messages: getFallbackMessages() });
      return;
    }
    const nextSelectedId = get().selectedSessionId === sessionId ? remaining[0].id : get().selectedSessionId;
    const messages = await aiStudentApi.listMessages(nextSelectedId || remaining[0].id);
    set({ sessions: remaining, selectedSessionId: nextSelectedId || remaining[0].id, messages: messages.length > 0 ? messages : getFallbackMessages() });
  },

  clearMessages: async () => {
    const selectedSessionId = get().selectedSessionId;
    if (!selectedSessionId) return;
    await aiStudentApi.deleteSession(selectedSessionId);
    const created = await aiStudentApi.createSession();
    const sessions = [created, ...get().sessions.filter(session => session.id !== selectedSessionId)];
    set({ sessions, selectedSessionId: created.id, messages: getFallbackMessages(), streamingContent: "", abortStream: null });
  },

  evaluateMessage: async (messageId) => {
    const state = get();
    const selectedSessionId = state.selectedSessionId;
    const targetMessage = state.messages.find(message => message.id === messageId && message.role === "assistant");
    if (!targetMessage || !selectedSessionId || targetMessage.isEvaluating) {
      return;
    }

    const assistantIndex = state.messages.findIndex(message => message.id === messageId);
    const questionMessage = [...state.messages]
      .slice(0, assistantIndex)
      .reverse()
      .find(message => message.role === "user");

    if (!questionMessage) {
      toast.error("Không tìm thấy câu hỏi gốc để đánh giá câu trả lời");
      return;
    }

    try {
      set((current) => ({
        messages: current.messages.map(message =>
          message.id === messageId
            ? { ...message, isEvaluating: true }
            : message,
        ),
      }));

      const job = await aiStudentApi.evaluateProgrammingAnswer({
        sessionId: selectedSessionId,
        messageId,
        question: questionMessage.content,
        answer: targetMessage.content,
        modelType: targetMessage.modelUsed || state.selectedModel,
      });

      set((current) => ({
        messages: current.messages.map(message =>
          message.id === messageId
                ? {
                    ...message,
                    evaluationJob: {
                      id: job.id,
                      status: job.status,
                },
                isEvaluating: true,
              }
            : message,
        ),
      }));

      while (true) {
        const status = await aiStudentApi.getEvaluationJob(job.id);
        if (status.status === "completed") {
          const evaluation: AIStudentEvaluationResult = {
            id: status.id,
            score: status.score,
            status: status.status,
            language: status.language,
            rationale: status.rationale,
            passed: status.passed,
            total: status.total,
            executionTimeMs: status.executionTimeMs,
            stderr: status.stderr,
            stdout: status.stdout,
            testCode: status.testCode,
            benchmark: status.benchmark,
            modelUsed: status.modelUsed,
          };

          set((current) => ({
            messages: current.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    evaluation,
                    evaluationJob: {
                      id: status.id,
                      status: status.status,
                      score: status.score,
                    },
                    isEvaluating: false,
                  }
                : message,
            ),
          }));

          toast.success("Đã tính mức độ tín nhiệm câu trả lời");
          return;
        }

        if (status.status === "failed") {
          set((current) => ({
            messages: current.messages.map(message =>
              message.id === messageId
                ? {
                    ...message,
                    evaluationJob: {
                      id: status.id,
                      status: status.status,
                    },
                    isEvaluating: false,
                  }
                : message,
            ),
          }));
          throw new Error(status.errorMessage || "Không thể đánh giá câu trả lời");
        }

        set((current) => ({
          messages: current.messages.map(message =>
            message.id === messageId
              ? {
                  ...message,
                  evaluationJob: {
                    id: status.id,
                    status: `${status.status}:${status.metadata?.stage || "processing"}`,
                    score: status.score,
                  },
                  isEvaluating: true,
                }
              : message,
          ),
        }));

        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    catch (error) {
      set((current) => ({
        messages: current.messages.map(message =>
          message.id === messageId
            ? { ...message, isEvaluating: false }
            : message,
        ),
      }));
      toast.error((error as Error).message || "Không thể đánh giá câu trả lời");
    }
  },

  sendMessage: async (content) => {
    const trimmed = content.trim();
    const selectedSessionId = get().selectedSessionId;
    const selectedModel = get().selectedModel;
    if (!trimmed || !selectedSessionId) return;
    const fastMode = shouldUseFastMode(trimmed, selectedModel);

    const currentSession = get().sessions.find(session => session.id === selectedSessionId);
    const shouldRenameSession = isPlaceholderSession(currentSession);
    const nextTitle = buildSessionTitleFromPrompt(trimmed) || "Đoạn chat mới";

    const currentAbort = get().abortStream;
    if (currentAbort) currentAbort();

    const userMessage = createLocalMessage("user", trimmed);
    set((state) => ({ isSending: true, messages: [...state.messages, userMessage], streamingContent: "" }));

    try {
      if (shouldRenameSession) {
        const updatedSession = await aiStudentApi.updateSession(selectedSessionId, nextTitle);
        set((state) => ({
          sessions: state.sessions.map(session => session.id === selectedSessionId ? updatedSession : session),
        }));
      }

      await aiStudentApi.createMessage(selectedSessionId, { role: "user", content: trimmed });
      const history = get().messages.map(message => ({ role: message.role, content: message.content } as AIStudentMessage));
      let streamedAnswer = "";

      const abort = aiStudentApi.streamProgrammingTutor(
        { query: trimmed, history, topK: STUDENT_TUTOR_TOP_K, modelType: selectedModel, fastMode },
        (chunk) => {
          streamedAnswer += chunk;
          set({ streamingContent: streamedAnswer });
        },
        async (donePayload) => {
          const assistantPayload = extractAssistantPayload(streamedAnswer, donePayload);
          if (!assistantPayload.content) {
            const response = await aiStudentApi.askProgrammingTutor({ query: trimmed, history, topK: STUDENT_TUTOR_TOP_K, modelType: selectedModel, fastMode });
            const persistedAssistant = await aiStudentApi.createMessage(selectedSessionId, {
              role: "assistant",
              content: response.answer,
              sources: response.sources,
              confidence: response.confidence,
              modelUsed: response.modelUsed,
            });
            set((state) => ({
              isSending: false,
              messages: [...state.messages, persistedAssistant],
              streamingContent: "",
              abortStream: null,
            }));
            return;
          }

          const persistedAssistant = await aiStudentApi.createMessage(selectedSessionId, {
            role: "assistant",
            content: assistantPayload.content,
            sources: assistantPayload.sources,
            confidence: assistantPayload.confidence,
            modelUsed: assistantPayload.modelUsed ?? selectedModel,
          });
          set((state) => ({
            isSending: false,
            messages: [...state.messages, persistedAssistant],
            streamingContent: "",
            abortStream: null,
          }));
        },
        async (errorMessage) => {
          try {
            const response = await aiStudentApi.askProgrammingTutor({ query: trimmed, history, topK: STUDENT_TUTOR_TOP_K, modelType: selectedModel, fastMode });
            const persistedAssistant = await aiStudentApi.createMessage(selectedSessionId, {
              role: "assistant",
              content: response.answer,
              sources: response.sources,
              confidence: response.confidence,
              modelUsed: response.modelUsed,
            });
            set((state) => ({
              isSending: false,
              messages: [...state.messages, persistedAssistant],
              streamingContent: "",
              abortStream: null,
            }));
          }
          catch {
            set({ isSending: false, streamingContent: "", abortStream: null });
            toast.error(errorMessage || "Không thể gửi câu hỏi tới trợ lý AI");
          }
        },
      );

      set({ abortStream: abort });
    }
    catch (error) {
      set({ isSending: false, streamingContent: "", abortStream: null });
      toast.error((error as Error).message || "Không thể gửi câu hỏi tới trợ lý AI");
    }
  },

  stopStreaming: () => {
    const abort = get().abortStream;
    if (abort) abort();
    set({ abortStream: null, isSending: false, streamingContent: "" });
  },
}));
