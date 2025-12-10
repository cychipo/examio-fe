/**
 * Credit cost calculation utilities
 * Used to calculate and preview costs before API calls
 */

/**
 * Calculate OCR/embedding cost based on file size
 * Formula: max(2, ceil(file_size_MB))
 * @param fileSizeBytes - File size in bytes
 * @returns Cost in tokens
 */
export function calculateOcrCost(fileSizeBytes: number): number {
  return Math.max(2, Math.ceil(fileSizeBytes / (1024 * 1024)));
}

/**
 * Calculate question/flashcard generation cost
 * Formula: ceil(count / 10) - 10 questions = 1 token
 * @param questionCount - Number of questions/flashcards to generate
 * @returns Cost in tokens
 */
export function calculateQuestionCost(questionCount: number): number {
  return Math.ceil(questionCount / 10);
}

/**
 * Calculate total cost for new file upload + generation
 * @param fileSizeBytes - File size in bytes
 * @param questionCount - Number of questions/flashcards to generate
 * @returns Total cost breakdown
 */
export function calculateTotalCost(
  fileSizeBytes: number,
  questionCount: number
): { ocrCost: number; questionCost: number; totalCost: number } {
  const ocrCost = calculateOcrCost(fileSizeBytes);
  const questionCost = calculateQuestionCost(questionCount);
  return {
    ocrCost,
    questionCost,
    totalCost: ocrCost + questionCost,
  };
}

/**
 * Calculate cost for regenerating from existing file (no OCR needed)
 * @param questionCount - Number of questions/flashcards to generate
 * @returns Cost in tokens
 */
export function calculateRegenerateCost(questionCount: number): number {
  return calculateQuestionCost(questionCount);
}

/**
 * Check if user has enough balance for the operation
 * @param balance - Current user balance
 * @param requiredCost - Required cost for the operation
 * @returns Object with isEnough flag and deficit if not enough
 */
export function checkBalance(
  balance: number,
  requiredCost: number
): { isEnough: boolean; deficit: number } {
  const deficit = Math.max(0, requiredCost - balance);
  return {
    isEnough: balance >= requiredCost,
    deficit,
  };
}

/**
 * Format cost breakdown message for user display
 * @param costs - Cost breakdown object
 * @param balance - Current user balance
 * @returns Formatted message string
 */
export function formatCostMessage(
  costs: { ocrCost: number; questionCost: number; totalCost: number },
  balance: number
): string {
  const lines = [
    `📊 Chi phí dự kiến:`,
    `   • Xử lý file: ${costs.ocrCost} token`,
    `   • Tạo câu hỏi: ${costs.questionCost} token`,
    `   • Tổng: ${costs.totalCost} token`,
    `💰 Số dư hiện tại: ${balance} token`,
  ];

  if (balance < costs.totalCost) {
    lines.push(`❌ Thiếu: ${costs.totalCost - balance} token`);
  }

  return lines.join("\n");
}
