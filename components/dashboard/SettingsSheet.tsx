"use client";

import { useEffect, useRef } from "react";
import { CircleUserRound, MessageSquareShare, Sparkles, X } from "lucide-react";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import ChannelsPanel from "@/components/dashboard/ChannelsPanel";
import SkillsPanel from "@/components/dashboard/SkillsPanel";
import type {
  AccountSummary,
  ChannelsSummary,
  DrawerSectionId,
  SkillsSummary,
} from "@/components/dashboard/types";

type SettingsSheetProps = {
  open: boolean;
  onClose: () => void;
  activeSection: DrawerSectionId;
  onActiveSectionChange: (section: DrawerSectionId) => void;
  onAccountSummaryChange: (summary: AccountSummary) => void;
  onChannelsSummaryChange: (summary: ChannelsSummary) => void;
  onSkillsSummaryChange: (summary: SkillsSummary) => void;
};

const tabs = [
  { id: "account" as const, label: "Account", icon: CircleUserRound },
  { id: "channels" as const, label: "Channels", icon: MessageSquareShare },
  { id: "skills" as const, label: "Skills", icon: Sparkles },
];

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const nodes = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (node) => !node.hasAttribute("disabled") && !node.getAttribute("aria-hidden")
  );
}

export default function SettingsSheet({
  open,
  onClose,
  activeSection,
  onActiveSectionChange,
  onAccountSummaryChange,
  onChannelsSummaryChange,
  onSkillsSummaryChange,
}: SettingsSheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusables = getFocusableElements(panelRef.current);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const activeFocusables = getFocusableElements(panelRef.current);
      if (activeFocusables.length === 0) return;

      const first = activeFocusables[0];
      const last = activeFocusables[activeFocusables.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sectionTitle = tabs.find((t) => t.id === activeSection)?.label ?? "Settings";

  return (
    <div className="animate-fade-in-fast fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/20"
        aria-label="Close settings"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="animate-slide-in-right relative flex h-full w-[400px] max-w-[90vw] flex-col border-l border-surface-200 bg-white"
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-800">{sectionTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg border border-surface-200 bg-white p-2 text-ink-600 hover:border-surface-300"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 border-b border-surface-200 px-5 py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onActiveSectionChange(tab.id)}
                className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition ${
                  activeSection === tab.id
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "text-ink-500 hover:bg-surface-100 hover:text-ink-700 border border-transparent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeSection === "account" && (
            <ProfileSettings variant="embedded" onSummaryChange={onAccountSummaryChange} />
          )}
          {activeSection === "channels" && (
            <ChannelsPanel variant="embedded" onSummaryChange={onChannelsSummaryChange} />
          )}
          {activeSection === "skills" && (
            <SkillsPanel variant="embedded" onSummaryChange={onSkillsSummaryChange} />
          )}
        </div>
      </div>
    </div>
  );
}
