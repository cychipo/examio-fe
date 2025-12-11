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

// ==================== Payment Types ====================

export interface PaymentWithQR {
  paymentId: string;
  amount: number;
  qrUrl: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface PaymentStatus {
  id: string;
  amount: number;
  status: number;
  statusLabel: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  tier: number;
  name: string;
  nameVi: string;
  creditsPerMonth: number;
  filesPerMonth: number;
  messagesPerMinute: number;
  chatMessagesLimit: number;
  priceMonthly: number;
  priceYearly: number;
}

export interface UserSubscription {
  id?: string;
  tier: number;
  tierName: string;
  billingCycle?: string;
  isActive: boolean;
  benefits: SubscriptionPlan;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

// ==================== Payment API Functions ====================

/**
 * Create payment for credits purchase
 */
export async function createCreditPaymentApi(
  credits: number
): Promise<PaymentWithQR> {
  const response = await api.post("/payment/create", {
    type: "credits",
    credits,
  });
  return response.data;
}

/**
 * Create payment for subscription
 */
export async function createSubscriptionPaymentApi(
  tier: number,
  billingCycle: "monthly" | "yearly"
): Promise<PaymentWithQR> {
  const response = await api.post("/payment/create", {
    type: "subscription",
    subscriptionTier: tier,
    billingCycle,
  });
  return response.data;
}

/**
 * Check payment status
 */
export async function getPaymentStatusApi(
  paymentId: string
): Promise<PaymentStatus> {
  const response = await api.get(`/payment/status/${paymentId}`);
  return response.data;
}

/**
 * Get current user subscription
 */
export async function getSubscriptionApi(): Promise<UserSubscription> {
  const response = await api.get("/payment/subscription");
  return response.data;
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlansApi(): Promise<SubscriptionPlan[]> {
  const response = await api.get("/payment/subscription/plans");
  return response.data;
}
