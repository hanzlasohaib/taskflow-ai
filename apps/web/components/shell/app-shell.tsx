"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AiAssistantPanel } from "@/components/dashboard/ai-assistant-panel";
import { VoiceRecordDialog } from "@/components/dashboard/voice-record-dialog";
import { AccountGateModal } from "@/components/demo/account-gate-modal";
import { GuestModeBanner } from "@/components/demo/guest-mode-banner";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopNav } from "@/components/shell/app-topnav";
import type { AccountGateIntent } from "@/lib/demo/gates";

type ShellActions = {
  openAi: () => void;
  openVoice: () => void;
  requireAccount: (intent: AccountGateIntent) => void;
};

const ShellActionsContext = createContext<ShellActions | null>(null);

export function useShellActions(): ShellActions {
  const ctx = useContext(ShellActionsContext);
  if (!ctx) {
    return {
      openAi: () => undefined,
      openVoice: () => undefined,
      requireAccount: () => undefined,
    };
  }
  return ctx;
}

type AppShellProps = {
  userName: string;
  userImage?: string | null;
  variant?: "auth" | "demo";
  children: React.ReactNode;
};

export function AppShell({ userName, userImage, variant = "auth", children }: AppShellProps) {
  const isDemo = variant === "demo";
  const [collapsed, setCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<AccountGateIntent | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const openAi = useCallback(() => setAiOpen(true), []);
  const openVoice = useCallback(() => setVoiceOpen(true), []);
  const requireAccount = useCallback((intent: AccountGateIntent) => {
    setGateIntent(intent);
  }, []);
  const actions = useMemo(
    () => ({ openAi, openVoice, requireAccount }),
    [openAi, openVoice, requireAccount],
  );

  return (
    <ShellActionsContext.Provider value={actions}>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          userName={userName}
          userImage={userImage}
          variant={variant}
          onOpenAi={openAi}
          onOpenVoice={openVoice}
          onRequireAccount={requireAccount}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          {isDemo ? <GuestModeBanner /> : null}
          <AppTopNav
            userName={userName}
            userImage={userImage}
            variant={variant}
            onRequireAccount={requireAccount}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
        <AiAssistantPanel
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          demo={isDemo}
          onRequireAccount={() => requireAccount("ai-generate")}
        />
        <VoiceRecordDialog open={voiceOpen} onClose={() => setVoiceOpen(false)} />
        <AccountGateModal intent={gateIntent} onClose={() => setGateIntent(null)} />
      </div>
    </ShellActionsContext.Provider>
  );
}
