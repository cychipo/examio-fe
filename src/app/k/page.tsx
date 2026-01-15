"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, initializing } = useAuthStore();

  useEffect(() => {
    if (!initializing) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.replace("/login");
      } else if (user?.role === "teacher") {
        // Redirect teachers to Dashboard
        router.replace("/k/dashboard-teacher");
      } else {
        // Redirect students to Dashboard
        router.replace("/k/dashboard-student");
      }
    }
  }, [isAuthenticated, user, initializing, router]);

  // Show loading while checking authentication
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}
