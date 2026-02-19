"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";
import ChatPanel from "@/components/dashboard/ChatPanel";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import DashboardStatusStrip from "@/components/dashboard/DashboardStatusStrip";
import type {
  AccountSummary,
  ChannelsSummary,
  ChatSummary,
  DrawerSectionId,
  SkillsSummary,
} from "@/components/dashboard/types";

type DashboardShellV2Props = {
  preferredName: string | null;
};

const DRAWER_STORAGE_KEY = "dashboard.drawerCollapsed";

const defaultChatSummary: ChatSummary = {
  phase: "awaiting",
  connectionStatus: "connecting",
  error: "",
  connected: false,
};

export default function DashboardShellV2({ preferredName }: DashboardShellV2Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DrawerSectionId>("account");
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [channelsSummary, setChannelsSummary] = useState<ChannelsSummary | null>(null);
  const [skillsSummary, setSkillsSummary] = useState<SkillsSummary | null>(null);
  const [chatSummary, setChatSummary] = useState<ChatSummary>(defaultChatSummary);

  useEffect(() => {
    let cancelled = false;

    async function loadToplineSummary() {
      try {
        const [meRes, channelsRes] = await Promise.all([
          fetch("/api/dashboard/me", { cache: "no-store" }),
          fetch("/api/dashboard/channels", { cache: "no-store" }),
        ]);

        if (meRes.ok) {
          const me = (await meRes.json()) as {
            preferred_name?: string | null;
            persona?: string;
            tier?: string;
          };
          if (!cancelled) {
            setAccountSummary({
              preferredName: me.preferred_name || "",
              persona: me.persona || "personal-assistant",
              tier: me.tier || "standard",
            });
          }
        }

        if (channelsRes.ok) {
          const channels = (await channelsRes.json()) as Array<{
            channel: "telegram" | "whatsapp" | "imessage";
            status: "connected" | "not_connected" | "coming_soon";
          }>;
          if (!cancelled) {
            setChannelsSummary({
              loading: false,
              error: "",
              total: channels.length,
              connected: channels.filter((channel) => channel.status === "connected").length,
              telegramStatus:
                channels.find((channel) => channel.channel === "telegram")?.status || "not_connected",
            });
          }
        }
      } catch {
        // Non-blocking: section callbacks will refresh summary after drawer panels mount.
      }
    }

    void loadToplineSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const persisted = window.localStorage.getItem(DRAWER_STORAGE_KEY);
      if (persisted === "true" || persisted === "false") {
        setCollapsed(persisted === "true");
      }
    } catch {
      // Ignore localStorage access issues.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAWER_STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore localStorage access issues.
    }
  }, [collapsed]);

  const openSection = useCallback((section: DrawerSectionId) => {
    setActiveSection(section);

    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileOpen(true);
      return;
    }

    setCollapsed(false);
  }, []);

  return (
    <main className="min-h-screen bg-surface-100">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="focus-ring inline-flex rounded-lg border border-surface-300 bg-white p-2 text-ink-500 hover:border-ink-200 lg:hidden"
              aria-label="Open settings drawer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="font-display text-2xl tracking-tight text-ink-800">ClawsRUs Dashboard</p>
              <p className="text-sm text-ink-400">
                Welcome{preferredName ? `, ${preferredName}` : ""}. Your assistant workspace is ready.
              </p>
            </div>
          </div>

          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto flex h-[calc(100dvh-97px)] w-full max-w-[1600px] min-w-0 gap-0 px-0 sm:px-0">
        <DashboardDrawer
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          activeSection={activeSection}
          onActiveSectionChange={setActiveSection}
          onAccountSummaryChange={setAccountSummary}
          onChannelsSummaryChange={setChannelsSummary}
          onSkillsSummaryChange={setSkillsSummary}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-3.5 p-3 sm:p-4">
          <div className="animate-fade-in-up animate-stagger-1">
            <DashboardStatusStrip
              accountSummary={accountSummary}
              channelsSummary={channelsSummary}
              skillsSummary={skillsSummary}
              chatSummary={chatSummary}
              onOpenSection={openSection}
            />
          </div>

          <div className="animate-fade-in-up animate-stagger-2 min-h-0 flex-1">
            <ChatPanel onSummaryChange={setChatSummary} />
          </div>
        </section>
      </div>
    </main>
  );
}
