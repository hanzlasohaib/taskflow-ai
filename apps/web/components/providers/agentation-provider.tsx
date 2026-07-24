"use client";

import { Agentation } from "agentation";

export function AgentationProvider() {
  return <Agentation endpoint="http://localhost:4747" />;
}