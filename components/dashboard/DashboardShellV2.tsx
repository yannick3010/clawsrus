"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import ChatPanel from "@/components/dashboard/ChatPanel";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import DashboardStatusStrip from "@/components/dashboard/DashboardStatusStrip";
import SettingsSheet from "@/components/dashboard/SettingsSheet";
import DashboardTrialBanner from "@/components/dashboard/DashboardTrialBanner";
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

const defaultChatSummary: ChatSummary = {
  phase: "awaiting",
  connectionStatus: "connecting",
  error: "",
  connected: false,
};

export default function DashboardShellV2({ preferredName }: DashboardShellV2Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSection, setSheetSection] = useState<DrawerSectionId>("account");
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
            plan_code?: string;
            setup_package?: string;
          };
          if (!cancelled) {
            setAccountSummary({
              preferredName: me.preferred_name || "",
              persona: me.persona || "personal-assistant",
              membershipPlan: me.plan_code || me.tier || "free",
              setupPackage: me.setup_package || "standard",
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

  const openSheet = useCallback((section: DrawerSectionId) => {
    setSheetSection(section);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-200/60 p-0 sm:p-2 lg:p-4">
      <div className="flex h-dvh w-full max-w-[1440px] overflow-hidden bg-surface-100 sm:h-[calc(100dvh-16px)] sm:rounded-2xl sm:border sm:border-surface-200 sm:shadow-surface-2 lg:h-[calc(100dvh-32px)]">
        <DashboardDrawer
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          activeSection={sheetSection}
          onOpenSheet={openSheet}
          preferredName={preferredName}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-surface-200 bg-white px-3 py-2.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="focus-ring rounded-lg border border-surface-200 bg-white p-2 text-ink-600 hover:border-surface-300"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-ink-800">ClawsRUs</span>
            <div className="w-9" />
          </div>

          <DashboardTrialBanner />

          <div className="animate-fade-in-up animate-stagger-1">
            <DashboardStatusStrip
              accountSummary={accountSummary}
              channelsSummary={channelsSummary}
              skillsSummary={skillsSummary}
              chatSummary={chatSummary}
              onOpenSheet={openSheet}
            />
          </div>

          <div className="animate-fade-in-up animate-stagger-2 flex min-h-0 flex-1 flex-col">
            <ChatPanel onSummaryChange={setChatSummary} />
          </div>
        </div>
      </div>

      <SettingsSheet
        open={sheetOpen}
        onClose={closeSheet}
        activeSection={sheetSection}
        onActiveSectionChange={setSheetSection}
        onAccountSummaryChange={setAccountSummary}
        onChannelsSummaryChange={setChannelsSummary}
        onSkillsSummaryChange={setSkillsSummary}
      />
    </main>
  );
}
