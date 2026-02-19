"use client";

import { type MutableRefObject, type ReactNode, useEffect, useMemo, useRef } from "react";
import {
  CircleUserRound,
  MessageSquareShare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import ChannelsPanel from "@/components/dashboard/ChannelsPanel";
import SkillsPanel from "@/components/dashboard/SkillsPanel";
import type {
  AccountSummary,
  ChannelsSummary,
  DrawerSectionId,
  SkillsSummary,
} from "@/components/dashboard/types";

type DashboardDrawerProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  activeSection: DrawerSectionId;
  onActiveSectionChange: (section: DrawerSectionId) => void;
  onAccountSummaryChange: (summary: AccountSummary) => void;
  onChannelsSummaryChange: (summary: ChannelsSummary) => void;
  onSkillsSummaryChange: (summary: SkillsSummary) => void;
};

const sections = [
  { id: "account" as const, label: "Account", icon: CircleUserRound },
  { id: "channels" as const, label: "Channels", icon: MessageSquareShare },
  { id: "skills" as const, label: "Skills", icon: Sparkles },
];

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  const nodes = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  return Array.from(nodes).filter((node) => !node.hasAttribute("disabled") && !node.getAttribute("aria-hidden"));
}

export default function DashboardDrawer({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
  activeSection,
  onActiveSectionChange,
  onAccountSummaryChange,
  onChannelsSummaryChange,
  onSkillsSummaryChange,
}: DashboardDrawerProps) {
  const accountRef = useRef<HTMLElement | null>(null);
  const channelsRef = useRef<HTMLElement | null>(null);
  const skillsRef = useRef<HTMLElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  const activeRef = useMemo(() => {
    if (activeSection === "account") {
      return accountRef;
    }
    if (activeSection === "channels") {
      return channelsRef;
    }
    return skillsRef;
  }, [activeSection]);

  useEffect(() => {
    if (collapsed && !mobileOpen) {
      return;
    }
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeRef, collapsed, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusables = getFocusableElements(mobilePanelRef.current);
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileOpenChange(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const activeFocusables = getFocusableElements(mobilePanelRef.current);
      if (activeFocusables.length === 0) {
        return;
      }

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

  function selectSection(section: DrawerSectionId) {
    onActiveSectionChange(section);
  }

  return (
    <>
      <aside
        className={`hidden h-full border-r border-surface-200 bg-white transition-[width] duration-200 lg:flex lg:flex-col ${
          collapsed ? "w-[72px]" : "w-[320px]"
        }`}
        aria-label="Dashboard settings drawer"
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-3 py-3">
          {!collapsed ? <p className="text-sm font-semibold text-navy-700">Workspace Settings</p> : null}
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand drawer" : "Collapse drawer"}
            aria-expanded={!collapsed}
            className="focus-ring rounded-lg border border-surface-200 bg-white p-2 text-navy-600 hover:border-surface-300"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {collapsed ? (
            <nav className="flex flex-col items-center gap-2 py-3" aria-label="Drawer sections">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      onCollapsedChange(false);
                      selectSection(section.id);
                    }}
                    className={`focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border text-navy-600 transition ${
                      activeSection === section.id
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-surface-200 bg-white hover:border-surface-300"
                    }`}
                    aria-label={section.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="space-y-4 p-3">
              <DrawerSection
                id="account"
                label="Account"
                active={activeSection === "account"}
                onClick={() => selectSection("account")}
                sectionRef={accountRef}
              >
                <ProfileSettings variant="embedded" onSummaryChange={onAccountSummaryChange} />
              </DrawerSection>

              <DrawerSection
                id="channels"
                label="Channels"
                active={activeSection === "channels"}
                onClick={() => selectSection("channels")}
                sectionRef={channelsRef}
              >
                <ChannelsPanel variant="embedded" onSummaryChange={onChannelsSummaryChange} />
              </DrawerSection>

              <DrawerSection
                id="skills"
                label="Skills"
                active={activeSection === "skills"}
                onClick={() => selectSection("skills")}
                sectionRef={skillsRef}
              >
                <SkillsPanel variant="embedded" onSummaryChange={onSkillsSummaryChange} />
              </DrawerSection>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen ? (
        <div className="animate-fade-in-fast fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="h-full flex-1 bg-navy-900/35"
            aria-label="Close drawer"
            onClick={() => onMobileOpenChange(false)}
          />
          <div
            ref={mobilePanelRef}
            className="flex h-full w-[320px] max-w-[88vw] flex-col border-l border-surface-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
              <p className="text-sm font-semibold text-navy-700">Workspace Settings</p>
              <button
                type="button"
                onClick={() => onMobileOpenChange(false)}
                className="focus-ring rounded-lg border border-surface-200 bg-white p-2 text-navy-600 hover:border-surface-300"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 p-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => selectSection(section.id)}
                      className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium ${
                        activeSection === section.id
                          ? "bg-white text-navy-700 shadow-surface-1"
                          : "text-navy-500 hover:text-navy-700"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {section.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <DrawerSection
                  id="account-mobile"
                  label="Account"
                  active={activeSection === "account"}
                  onClick={() => selectSection("account")}
                  sectionRef={accountRef}
                >
                  <ProfileSettings variant="embedded" onSummaryChange={onAccountSummaryChange} />
                </DrawerSection>

                <DrawerSection
                  id="channels-mobile"
                  label="Channels"
                  active={activeSection === "channels"}
                  onClick={() => selectSection("channels")}
                  sectionRef={channelsRef}
                >
                  <ChannelsPanel variant="embedded" onSummaryChange={onChannelsSummaryChange} />
                </DrawerSection>

                <DrawerSection
                  id="skills-mobile"
                  label="Skills"
                  active={activeSection === "skills"}
                  onClick={() => selectSection("skills")}
                  sectionRef={skillsRef}
                >
                  <SkillsPanel variant="embedded" onSummaryChange={onSkillsSummaryChange} />
                </DrawerSection>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type DrawerSectionProps = {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
  sectionRef: MutableRefObject<HTMLElement | null>;
  children: ReactNode;
};

function DrawerSection({ id, label, active, onClick, sectionRef, children }: DrawerSectionProps) {
  return (
    <section
      id={id}
      ref={(node) => {
        sectionRef.current = node;
      }}
      className="scroll-mt-4"
    >
      <button
        type="button"
        onClick={onClick}
        className={`focus-ring mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${
          active
            ? "border-brand-200 bg-brand-50 text-brand-700"
            : "border-surface-200 bg-surface-50 text-navy-500 hover:border-surface-300"
        }`}
      >
        {label}
      </button>
      {children}
    </section>
  );
}
