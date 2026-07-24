export type AccountGateIntent =
  | "sync"
  | "share"
  | "realtime"
  | "ai-generate"
  | "profile"
  | "settings"
  | "workspace";

export const GATE_COPY: Record<
  AccountGateIntent,
  { title: string; description: string }
> = {
  sync: {
    title: "Sync requires an account",
    description: "Create a free account to save your workspace and sync across devices.",
  },
  share: {
    title: "Sharing requires an account",
    description: "Sign up to share workspaces and collaborate with your team.",
  },
  realtime: {
    title: "Realtime requires an account",
    description: "Live collaboration unlocks after you create a TaskFlow account.",
  },
  "ai-generate": {
    title: "Real AI requires an account",
    description: "You can explore the AI panel in demo mode. Full generation needs a signed-in workspace.",
  },
  profile: {
    title: "Profile requires an account",
    description: "Sign up to manage your profile and preferences.",
  },
  settings: {
    title: "Settings requires an account",
    description: "Sign up to persist settings across devices. Theme still works in this browser.",
  },
  workspace: {
    title: "Save your workspace",
    description: "Demo changes stay in this browser only. Create an account to keep your work.",
  },
};
