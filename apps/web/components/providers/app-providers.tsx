"use client";

import { AgentationProvider } from "@/components/providers/agentation-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <AgentationProvider />
    </ThemeProvider>
  );
}
