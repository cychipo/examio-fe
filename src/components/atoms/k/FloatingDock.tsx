"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface FloatingDockProps {
  items: {
    name: string;
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
  className?: string;
}

export function FloatingDock({ items, className }: FloatingDockProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dockContent = (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2",
        "flex items-center gap-2 w-full justify-center",
        "bg-background border-t border-border shadow-lg",
        className
      )}
      style={{ zIndex: 99999 }}>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.05 }}>
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "w-14 h-14 rounded-xl mx-auto",
                  "transition-all duration-200",
                  "active:scale-95"
                )}>
                <span className="text-foreground">{item.icon}</span>
              </button>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "w-14 h-14 rounded-xl",
                  "transition-all duration-200",
                  "active:scale-95"
                )}>
                <span className="text-foreground">{item.icon}</span>
              </Link>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Render to body using portal to escape stacking context
  if (!mounted) return null;
  return createPortal(dockContent, document.body);
}
