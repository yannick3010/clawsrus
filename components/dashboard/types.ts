export type DrawerSectionId = "account" | "channels" | "skills";

export type AccountSummary = {
  preferredName: string;
  persona: string;
  tier: string;
};

export type ChannelsSummary = {
  loading: boolean;
  error: string;
  total: number;
  connected: number;
  telegramStatus: "connected" | "not_connected" | "coming_soon";
};

export type SkillsSummary = {
  loading: boolean;
  error: string;
  total: number;
  installed: number;
  active: number;
  locked: number;
};

export type ChatSummary = {
  phase: "idle" | "awaiting" | "processing" | "responding";
  connectionStatus: "connecting" | "connected" | "reconnecting" | "disconnected";
  error: string;
  connected: boolean;
};
