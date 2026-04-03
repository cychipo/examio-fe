import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { setRedirectBackTarget } from "@/lib/authRedirect";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { isAuthenticated, initializing } = useAuthStore();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    setRedirectBackTarget(returnTo);
    return <Navigate to={`/login?from=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children ?? <Outlet />;
}
