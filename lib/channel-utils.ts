import { supabase } from "@/lib/supabase";

export type ChannelName = "telegram" | "whatsapp" | "imessage";
export type ChannelStatus = "connected" | "not_connected" | "coming_soon";

export type ChannelRecord = {
  channel: ChannelName;
  status: ChannelStatus;
  meta: Record<string, unknown>;
};

export const DEFAULT_CHANNELS: ChannelRecord[] = [
  { channel: "telegram", status: "not_connected", meta: {} },
  { channel: "whatsapp", status: "coming_soon", meta: {} },
  { channel: "imessage", status: "coming_soon", meta: {} },
];

export async function ensureDefaultChannels(userId: string) {
  const rows = DEFAULT_CHANNELS.map((entry) => ({
    user_id: userId,
    channel: entry.channel,
    status: entry.status,
    meta: entry.meta,
  }));

  const { error } = await supabase
    .from("user_channels")
    .upsert(rows, { onConflict: "user_id,channel", ignoreDuplicates: true });

  if (error && error.code !== "42P01") {
    throw error;
  }
}

export async function getChannelsForUser(userId: string): Promise<ChannelRecord[]> {
  const { data, error } = await supabase
    .from("user_channels")
    .select("channel,status,meta")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42P01") {
      return DEFAULT_CHANNELS;
    }
    throw error;
  }

  const result = (data || []) as Array<{
    channel: ChannelName;
    status: ChannelStatus;
    meta?: Record<string, unknown> | null;
  }>;

  const mapped = new Map<ChannelName, ChannelRecord>();
  for (const row of result) {
    mapped.set(row.channel, {
      channel: row.channel,
      status: row.status,
      meta: row.meta || {},
    });
  }

  for (const fallback of DEFAULT_CHANNELS) {
    if (!mapped.has(fallback.channel)) {
      mapped.set(fallback.channel, fallback);
    }
  }

  return [
    mapped.get("telegram")!,
    mapped.get("whatsapp")!,
    mapped.get("imessage")!,
  ];
}
