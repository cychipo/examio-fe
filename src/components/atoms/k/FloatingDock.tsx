"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface FloatingDockItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface FloatingDockProps {
  items: FloatingDockItem[];
  secondaryItems?: FloatingDockItem[];
  className?: string;
}

export function FloatingDock({
  items,
  secondaryItems,
  className,
}: FloatingDockProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showSecondary, setShowSecondary] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dockContent = (
    <>
      {/* Main Floating Dock */}
      <div
        className={cn(
          "fixed bottom-0 left-1/2 -translate-x-1/2",
          "flex items-center gap-2 w-full justify-center",
          "bg-background border-t border-border shadow-lg py-2",
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
                    "active:scale-95",
                    item.active && "text-[#e31837]"
                  )}>
                  <span className={cn(item.active && "text-[#e31837]")}>
                    {item.icon}
                  </span>
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center",
                    "w-14 h-14 rounded-xl",
                    "transition-all duration-200",
                    "active:scale-95",
                    item.active && "text-[#e31837]"
                  )}>
                  <span className={cn(item.active && "text-[#e31837]")}>
                    {item.icon}
                  </span>
                </Link>
              )}
            </motion.div>
          ))}

          {/* More button to show secondary items */}
          {secondaryItems && secondaryItems.length > 0 && (
            <motion.div
              key="more-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: items.length * 0.05 }}>
              <button
                onClick={() => setShowSecondary(!showSecondary)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "w-14 h-14 rounded-xl mx-auto",
                  "transition-all duration-200",
                  "active:scale-95",
                  (showSecondary ||
                    secondaryItems.some((item) => item.active)) &&
                    "text-[#e31837]"
                )}>
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5C13 4.77614 12.7761 5 12.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM7 7.5C7 7.22386 7.22386 7 7.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H7.5C7.22386 8 7 7.77614 7 7.5ZM4 10.5C4 10.2239 4.22386 10 4.5 10H12.5C12.7761 10 13 10.2239 13 10.5C13 10.7761 12.7761 11 12.5 11H4.5C4.22386 11 4 10.7761 4 10.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"></path>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer for secondary items */}
      {secondaryItems && secondaryItems.length > 0 && (
        <Drawer open={showSecondary} onOpenChange={setShowSecondary}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Thêm</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-y-1 p-2 pb-20">
              {secondaryItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setShowSecondary(false)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-colors",
                    item.active
                      ? "bg-[#fef2f2] text-[#e31837]"
                      : "hover:bg-[#fef2f2] hover:text-[#e31837]"
                  )}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );

  // Render to body using portal to escape stacking context
  if (!mounted) return null;
  return createPortal(dockContent, document.body);
}
