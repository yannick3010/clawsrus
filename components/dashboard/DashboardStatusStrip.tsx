"use client";

import { AlertTriangle, Bot, Cable, Sparkles, UserCircle2 } from "lucide-react";
import type {
  AccountSummary,
  ChannelsSummary,
  ChatSummary,
  DrawerSectionId,
  SkillsSummary,
} from "@/components/dashboard/types";

type DashboardStatusStripProps = {
  accountSummary: AccountSummary | null;
  channelsSummary: ChannelsSummary | null;
  skillsSummary: SkillsSummary | null;
  chatSummary: ChatSummary;
  onOpenSection: (section: DrawerSectionId) => void;
};

const baseChipClass =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium";

function getChatLabel(chat: ChatSummary) {
  if (chat.connectionStatus === "connecting") {
    return "Connecting";
  }
  if (chat.connectionStatus === "reconnecting") {
    return "Reconnecting";
  }
  if (chat.phase === "awaiting") {
    return "Loading";
  }
  if (chat.phase === "processing") {
    return "Processing";
  }
  if (chat.phase === "responding") {
    return "Responding";
  }
  return chat.connected ? "Connected" : "Offline";
}

export default function DashboardStatusStrip({
  accountSummary,
  channelsSummary,
  skillsSummary,
  chatSummary,
  onOpenSection,
}: DashboardStatusStripProps) {
  const chatConnected = chatSummary.connected;
  const channelConnected = (channelsSummary?.connected ?? 0) > 0;
  const skillsHealthy = (skillsSummary?.error || "") === "";

  return (
    <section className="space-y-2 rounded-xl border border-surface-200 bg-white px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${baseChipClass} border-surface-200 bg-surface-100 text-ink-700`}>
          <UserCircle2 className="h-3.5 w-3.5" />
          {accountSummary
            ? `${accountSummary.persona.replaceAll("-", " ")} - ${accountSummary.tier}`
            : "Profile loading"}
        </span>

        <button
          type="button"
          onClick={() => onOpenSection("channels")}
          className={`${baseChipClass} focus-ring border-surface-200 bg-surface-100 text-ink-700 hover:border-surface-300`}
        >
          <Cable className="h-3.5 w-3.5" />
          Channels {channelsSummary ? `${channelsSummary.connected}/${channelsSummary.total}` : "-"}
        </button>

        <button
          type="button"
          onClick={() => onOpenSection("skills")}
          className={`${baseChipClass} focus-ring border-surface-200 bg-surface-100 text-ink-700 hover:border-surface-300`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Skills {skillsSummary ? `${skillsSummary.enabled}/${skillsSummary.total}` : "-"}
        </button>

        <span
          className={`${baseChipClass} ${
            chatConnected
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-amber-200 bg-amber-50 text-status-warn"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          Chat {getChatLabel(chatSummary)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!chatConnected || chatSummary.error ? (
          <button
            type="button"
            onClick={() => onOpenSection("account")}
            className={`${baseChipClass} focus-ring border-amber-200 bg-amber-50 text-status-warn hover:border-amber-300`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {chatSummary.error ? "Chat error detected" : "Chat is not connected"}
          </button>
        ) : null}

        {channelsSummary && !channelConnected ? (
          <button
            type="button"
            onClick={() => onOpenSection("channels")}
            className={`${baseChipClass} focus-ring border-amber-200 bg-amber-50 text-status-warn hover:border-amber-300`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Connect at least one channel
          </button>
        ) : null}

        {skillsSummary && !skillsHealthy ? (
          <button
            type="button"
            onClick={() => onOpenSection("skills")}
            className={`${baseChipClass} focus-ring border-amber-200 bg-amber-50 text-status-warn hover:border-amber-300`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Skills status requires attention
          </button>
        ) : null}
      </div>
    </section>
  );
}
