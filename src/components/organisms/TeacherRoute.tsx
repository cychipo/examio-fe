"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export function TeacherRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, initializing } = useAuthStore();

  useEffect(() => {
    if (!initializing) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace("/login");
      } else if (user?.role !== "teacher") {
        // Redirect to home if not a teacher
        router.replace("/k");
      }
    }
  }, [isAuthenticated, user, initializing, router]);

  // Show nothing while checking authentication
  if (initializing || !isAuthenticated || user?.role !== "teacher") {
    return null;
  }

  return <>{children}</>;
}
