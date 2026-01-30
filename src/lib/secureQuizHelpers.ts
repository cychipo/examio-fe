/**
 * Secure Quiz Helpers
 * Utils for working with encrypted quiz API
 */

import {
  SecureQuestion,
  SecureAnswer,
  getSecureQuizApi,
  submitSecureQuizApi,
  SecureSubmitResponse,
} from "@/apis/examAttemptApi";
import { decryptQuizContent, decryptQuizOptions } from "@/lib/crypto";

/**
 * Decrypted question with original content
 * Same structure as the old Question interface for backwards compatibility
 */
export interface DecryptedQuestion {
  id: string; // We don't have real ID, use index as ID
  question: string;
  options: string[];
  token: string; // JWT token for this question
  index: number;
}

/**
 * Map to store question tokens by index
 * Used when submitting answers
 */
export type QuestionTokenMap = Map<number, string>;

/**
 * Decrypt a secure question
 */
export function decryptSecureQuestion(
  secureQuestion: SecureQuestion,
): DecryptedQuestion {
  return {
    id: `q_${secureQuestion.index}`, // Use index as ID since we don't expose real ID
    question: decryptQuizContent(secureQuestion.question_encrypted),
    options: decryptQuizOptions(secureQuestion.options_encrypted),
    token: secureQuestion.token,
    index: secureQuestion.index,
  };
}

/**
 * Decrypt all questions from secure quiz response
 */
export function decryptAllQuestions(
  secureQuestions: SecureQuestion[],
): DecryptedQuestion[] {
  return secureQuestions.map(decryptSecureQuestion);
}

/**
 * Build token map from decrypted questions
 * Maps question index to its JWT token
 */
export function buildQuestionTokenMap(
  questions: DecryptedQuestion[],
): QuestionTokenMap {
  const map = new Map<number, string>();
  questions.forEach((q) => {
    map.set(q.index, q.token);
  });
  return map;
}

/**
 * Convert answers to secure format with tokens
 * @param answers - Map of questionId to selected option (e.g. { "q_0": "A", "q_1": "B" })
 * @param tokenMap - Map of question index to JWT token
 */
export function convertAnswersToSecureFormat(
  answers: Record<string, string>,
  tokenMap: QuestionTokenMap,
): SecureAnswer[] {
  const secureAnswers: SecureAnswer[] = [];

  for (const [questionId, chosenOption] of Object.entries(answers)) {
    // Extract index from questionId (format: "q_0", "q_1", etc.)
    const indexMatch = questionId.match(/^q_(\d+)$/);
    if (!indexMatch) continue;

    const index = Number.parseInt(indexMatch[1], 10);
    const token = tokenMap.get(index);

    if (token) {
      secureAnswers.push({
        token,
        chosen_option: chosenOption,
      });
    }
  }

  return secureAnswers;
}

/**
 * Secure quiz state - contains both raw and decrypted data
 */
export interface SecureQuizState {
  attemptId: string;
  status: number;
  currentIndex: number;
  savedAnswers: Record<string, string>;
  markedQuestions: string[];
  totalQuestions: number;
  timeLimitMinutes: number | null;
  startedAt: string;
  questions: DecryptedQuestion[];
  tokenMap: QuestionTokenMap;
}

/**
 * Fetch secure quiz and decrypt all questions
 */
export async function fetchAndDecryptSecureQuiz(
  attemptId: string,
): Promise<SecureQuizState> {
  const response = await getSecureQuizApi(attemptId);

  const decryptedQuestions = decryptAllQuestions(response.questions);
  const tokenMap = buildQuestionTokenMap(decryptedQuestions);

  return {
    attemptId: response.attemptId,
    status: response.status,
    currentIndex: response.currentIndex,
    savedAnswers: response.answers,
    markedQuestions: response.markedQuestions,
    totalQuestions: response.totalQuestions,
    timeLimitMinutes: response.timeLimitMinutes,
    startedAt: response.startedAt,
    questions: decryptedQuestions,
    tokenMap,
  };
}

/**
 * Submit secure quiz with token verification
 */
export async function submitSecureQuiz(
  attemptId: string,
  answers: Record<string, string>,
  tokenMap: QuestionTokenMap,
): Promise<SecureSubmitResponse> {
  const secureAnswers = convertAnswersToSecureFormat(answers, tokenMap);
  return submitSecureQuizApi(attemptId, secureAnswers);
}
