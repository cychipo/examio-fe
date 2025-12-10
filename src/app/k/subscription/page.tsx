"use client";

import { useState, useEffect, useCallback } from "react";
import { SubscriptionTemplate } from "@/templates/SubscriptionTemplate";
import {
  getWalletDetailsApi,
  type WalletDetails,
} from "@/apis/subscriptionApi";
import { storeCache, CacheTTL } from "@/lib/storeCache";

export default function SubscriptionPage() {
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const data = await storeCache.fetchWithCache(
        storeCache.createKey("wallet-details", { page, size: PAGE_SIZE }),
        () => getWalletDetailsApi(page, PAGE_SIZE),
        { ttl: CacheTTL.FIVE_MINUTES }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <SubscriptionTemplate
      walletDetails={walletDetails}
      onPageChange={handlePageChange}
    />
  );
}
