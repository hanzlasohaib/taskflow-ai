"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-7 w-[52px] shrink-0 items-center rounded-full border border-border bg-muted p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Sun className="ml-0.5 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
      <Moon className="mr-0.5 ml-auto h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
      <motion.div
        className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm"
        animate={{ x: isDark ? 25 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.6 }}
        aria-hidden
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ duration: 0.12 }}
            >
              <Moon className="h-2.5 w-2.5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              transition={{ duration: 0.12 }}
            >
              <Sun className="h-2.5 w-2.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
