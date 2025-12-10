import { api } from "./api";

// ==================== Types ====================

export interface UsageBreakdown {
  examGeneration: number;
  flashcardCreation: number;
  pdfProcessing: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: number;
  typeLabel: string;
  direction: string; // ADD = cộng, SUBTRACT = trừ
  description: string | null;
  createdAt: string;
}

export interface TransactionPagination {
  data: Transaction[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface WalletDetails {
  id: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  usageBreakdown: UsageBreakdown;
  transactions: TransactionPagination;
}

// ==================== API Functions ====================

/**
 * Get detailed wallet information with paginated transactions
 * Uses backend cache for O(1) lookups
 */
export async function getWalletDetailsApi(
  page = 1,
  size = 10
): Promise<WalletDetails> {
  const response = await api.get("/wallet/details", {
    params: { page, size },
  });
  return response.data;
}
