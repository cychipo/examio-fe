import { useState, useEffect, useMemo } from "react";

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

const breakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function useScreenBreakpoint() {
  const [width, setWidth] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Set initial width
    setWidth(window.innerWidth);

    // Update width on resize
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isSmallerThanSm = useMemo(
    () => (isMounted ? width < breakpoints.sm : false),
    [isMounted, width]
  );

  const isSmallerThanMd = useMemo(
    () => (isMounted ? width < breakpoints.md : false),
    [isMounted, width]
  );

  const isSmallerThanLg = useMemo(
    () => (isMounted ? width < breakpoints.lg : false),
    [isMounted, width]
  );

  const isSmallerThanXl = useMemo(
    () => (isMounted ? width < breakpoints.xl : false),
    [isMounted, width]
  );

  const isSmallerThan2xl = useMemo(
    () => (isMounted ? width < breakpoints["2xl"] : false),
    [isMounted, width]
  );

  const isGreaterThanSm = useMemo(
    () => (isMounted ? width >= breakpoints.sm : true),
    [isMounted, width]
  );

  const isGreaterThanMd = useMemo(
    () => (isMounted ? width >= breakpoints.md : true),
    [isMounted, width]
  );

  const isGreaterThanLg = useMemo(
    () => (isMounted ? width >= breakpoints.lg : true),
    [isMounted, width]
  );

  const isGreaterThanXl = useMemo(
    () => (isMounted ? width >= breakpoints.xl : true),
    [isMounted, width]
  );

  const isGreaterThan2xl = useMemo(
    () => (isMounted ? width >= breakpoints["2xl"] : true),
    [isMounted, width]
  );

  const isMobile = useMemo(
    () => (isMounted ? width < breakpoints.md : false),
    [isMounted, width]
  );

  const isTablet = useMemo(
    () =>
      isMounted ? width >= breakpoints.md && width < breakpoints.lg : false,
    [isMounted, width]
  );

  const isDesktop = useMemo(
    () => (isMounted ? width >= breakpoints.lg : true),
    [isMounted, width]
  );

  return {
    isSmallerThanSm,
    isSmallerThanMd,
    isSmallerThanLg,
    isSmallerThanXl,
    isSmallerThan2xl,
    isGreaterThanSm,
    isGreaterThanMd,
    isGreaterThanLg,
    isGreaterThanXl,
    isGreaterThan2xl,
    isMobile,
    isTablet,
    isDesktop,
  };
}
