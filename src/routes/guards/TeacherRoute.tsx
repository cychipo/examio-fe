import type { PropsWithChildren } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function TeacherRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, initializing, user } = useAuthStore();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "teacher") {
    return <Navigate to="/k" replace />;
  }

  return children ?? <Outlet />;
}
