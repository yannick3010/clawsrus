"use client";

import { useEffect, useRef } from "react";
import {
  CircleUserRound,
  HelpCircle,
  MessageSquare,
  MessageSquareShare,
  Sparkles,
  X,
} from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";
import type { DrawerSectionId } from "@/components/dashboard/types";

type DashboardDrawerProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  activeSection: DrawerSectionId;
  onOpenSheet: (section: DrawerSectionId) => void;
  preferredName: string | null;
};

const settingsNav = [
  { id: "account" as const, label: "Account", icon: CircleUserRound },
  { id: "channels" as const, label: "Channels", icon: MessageSquareShare },
  { id: "skills" as const, label: "Skills", icon: Sparkles },
];

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const nodes = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (node) => !node.hasAttribute("disabled") && !node.getAttribute("aria-hidden")
  );
}

function SidebarContent({
  activeSection,
  onOpenSheet,
  preferredName,
  onClose,
}: {
  activeSection: DrawerSectionId;
  onOpenSheet: (section: DrawerSectionId) => void;
  preferredName: string | null;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Zone 1: Logo */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-surface-200 px-5">
        <span className="font-display text-lg tracking-tight text-ink-800">ClawsRUs</span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg border border-surface-200 bg-white p-1.5 text-ink-600 hover:border-surface-300"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Zone 2: Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3" aria-label="Dashboard navigation">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink-400">
          Workspace
        </p>
        <div className="mb-0.5 flex w-full items-center gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-[7px] text-[13px] font-medium text-brand-700">
          <MessageSquare className="h-[18px] w-[18px] opacity-60" />
          Chat
        </div>

        <p className="mb-1.5 mt-5 px-2.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink-400">
          Settings
        </p>
        {settingsNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenSheet(item.id)}
              className={`focus-ring mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition ${
                isActive
                  ? "border border-surface-300 bg-surface-100 text-ink-700"
                  : "border border-transparent text-ink-600 hover:bg-surface-100 hover:text-ink-700"
              }`}
            >
              <Icon className="h-[18px] w-[18px] opacity-60" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Utility */}
      <div className="flex-shrink-0 border-t border-surface-200 px-2.5 py-2">
        <a
          href="mailto:support@clawsrus.com"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] text-ink-500 transition hover:bg-surface-100 hover:text-ink-700"
        >
          <HelpCircle className="h-[18px] w-[18px] opacity-60" />
          Support
        </a>
      </div>

      {/* Zone 4: Profile footer */}
      <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-surface-200 px-4 py-3">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">
          {getInitials(preferredName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink-700">
            {preferredName || "User"}
          </p>
          <SignOutButton />
        </div>
      </div>
    </>
  );
}

export default function DashboardDrawer({
  mobileOpen,
  onMobileOpenChange,
  activeSection,
  onOpenSheet,
  preferredName,
}: DashboardDrawerProps) {
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusables = getFocusableElements(mobilePanelRef.current);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileOpenChange(false);
        return;
      }

      if (event.key !== "Tab") return;

      const activeFocusables = getFocusableElements(mobilePanelRef.current);
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
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      {/* Desktop sidebar — always 220px */}
      <aside
        className="hidden h-full w-[220px] flex-shrink-0 flex-col border-r border-surface-200 bg-surface-50 lg:flex"
        aria-label="Dashboard navigation"
      >
        <SidebarContent
          activeSection={activeSection}
          onOpenSheet={onOpenSheet}
          preferredName={preferredName}
        />
      </aside>

      {/* Mobile drawer — slides from left */}
      {mobileOpen ? (
        <div
          className="animate-fade-in-fast fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={mobilePanelRef}
            className="animate-slide-in-left flex h-full w-[280px] max-w-[85vw] flex-col border-r border-surface-200 bg-white"
          >
            <SidebarContent
              activeSection={activeSection}
              onOpenSheet={(section) => {
                onMobileOpenChange(false);
                onOpenSheet(section);
              }}
              preferredName={preferredName}
              onClose={() => onMobileOpenChange(false)}
            />
          </div>
          <button
            type="button"
            className="h-full flex-1 bg-ink-900/30"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          />
        </div>
      ) : null}
    </>
  );
}
