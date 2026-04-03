"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function TeacherRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, initializing } = useAuthStore();

  useEffect(() => {
    if (!initializing) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (user?.role !== "teacher") {
        navigate("/k", { replace: true });
      }
    }
  }, [isAuthenticated, user, initializing, navigate]);

  // Show nothing while checking authentication
  if (initializing || !isAuthenticated || user?.role !== "teacher") {
    return null;
  }

  return <>{children}</>;
}
