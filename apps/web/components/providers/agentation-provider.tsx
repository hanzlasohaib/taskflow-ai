"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Dev-only annotation overlay. Must not import `agentation` at module scope —
 * a static import breaks Next.js production prerender (React dispatcher null).
 */
export function AgentationProvider() {
  const [node, setNode] = useState<ReactNode>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;
    void import("agentation").then(({ Agentation }) => {
      if (!cancelled) {
        setNode(<Agentation endpoint="http://localhost:4747" />);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{node}</>;
}
