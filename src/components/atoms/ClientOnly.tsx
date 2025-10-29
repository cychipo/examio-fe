"use client";

import { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component wrapper to only render children on client-side after mount
 * Useful for preventing hydration mismatches with dynamic content
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
