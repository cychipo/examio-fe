import { useState, useEffect, useCallback } from "react";
import { getWalletDetailsApi, type WalletDetails } from "@/apis/subscriptionApi";
import { storeCache, CacheTTL } from "@/lib/storeCache";

export default function SubscriptionPage() {
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const data = await storeCache.fetchWithCache(
        storeCache.createKey("wallet-details", { page, size: PAGE_SIZE }),
        () => getWalletDetailsApi(page, PAGE_SIZE),
        { ttl: CacheTTL.FIVE_MINUTES },
      );
      setWalletDetails(data);
    } catch (error) {
      console.error("Failed to fetch wallet details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading || !walletDetails) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ví và gói dịch vụ</h1>
        <p className="text-muted-foreground">Theo dõi số dư và lịch sử giao dịch.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
          <div className="mt-2 text-3xl font-bold text-primary">{walletDetails.balance.toLocaleString("vi-VN")} credits</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-muted-foreground">Tổng giao dịch</div>
          <div className="mt-2 text-3xl font-bold">{walletDetails.transactions.data.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>
          <div className="text-sm text-muted-foreground">Trang {currentPage}</div>
        </div>
        <div className="space-y-3">
          {walletDetails.transactions.data.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="font-medium">{transaction.type}</div>
                <div className="text-sm text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</div>
              </div>
              <div className="font-semibold">{transaction.amount.toLocaleString("vi-VN")}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Trang trước
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={walletDetails.transactions.data.length < PAGE_SIZE}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
