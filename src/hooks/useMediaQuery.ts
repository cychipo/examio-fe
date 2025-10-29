"use client";

import { useEffect, useState } from "react";

/**
 * Hook to use media queries with proper SSR handling
 * Only returns true/false after component mounts to avoid hydration mismatch
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean - true if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  // Return false during SSR to prevent hydration mismatch
  // Component will re-render after mount with correct value
  return mounted && matches;
}

/**
 * Predefined breakpoint hooks matching Tailwind defaults
 */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
export const useIsLargeDesktop = () => useMediaQuery("(min-width: 1024px)");
