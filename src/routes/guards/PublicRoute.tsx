import type { PropsWithChildren } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function PublicRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, initializing, user } = useAuthStore();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectTo = user?.role === "teacher" ? "/k/dashboard-teacher" : "/k/dashboard-student";
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? <Outlet />;
}
