"use client";

import { useAuthSync } from "@/hooks/useAuthSync";

export function AuthSyncBootstrap() {
  useAuthSync();
  return null;
}
