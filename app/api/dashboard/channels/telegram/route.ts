import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import {
  applyTelegramRuntimeConfig,
  removeTelegramRuntimeConfig,
} from "@/lib/runtime-channels";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bot_token } = (await req.json()) as { bot_token?: string };
    const token = bot_token?.trim();

    if (!token) {
      return NextResponse.json({ error: "bot_token is required" }, { status: 400 });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const tgData = await tgRes.json();

    if (!tgData.ok || !tgData.result?.username) {
      return NextResponse.json(
        { error: "Invalid Telegram bot token" },
        { status: 400 }
      );
    }

    const botUsername = String(tgData.result.username);

    // Apply runtime config BEFORE persisting to the database so we never
    // mark the channel as "connected" when the container was not actually
    // reconfigured (the bot would not respond to Telegram messages).
    const runtimeResult = await applyTelegramRuntimeConfig({
      userId: auth.appUser.id,
      botToken: token,
      botUsername,
    });

    if (!runtimeResult.updated) {
      const reason = "reason" in runtimeResult ? runtimeResult.reason : "unknown";
      return NextResponse.json(
        { error: `Failed to activate Telegram bot: ${reason}` },
        { status: 502 }
      );
    }

    const now = new Date().toISOString();
    const [{ error: userUpdateError }, { error: channelUpdateError }] = await Promise.all([
      supabase
        .from("users")
        .update({
          telegram_bot_token: token,
          telegram_bot_username: botUsername,
          updated_at: now,
        })
        .eq("id", auth.appUser.id),
      supabase.from("user_channels").upsert(
        {
          user_id: auth.appUser.id,
          channel: "telegram",
          status: "connected",
          meta: { bot_username: botUsername },
          updated_at: now,
        },
        { onConflict: "user_id,channel" }
      ),
    ]);

    if (userUpdateError) {
      return NextResponse.json(
        { error: userUpdateError.message },
        { status: 500 }
      );
    }

    if (channelUpdateError && channelUpdateError.code !== "42P01") {
      return NextResponse.json(
        { error: channelUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      connected: true,
      bot_username: botUsername,
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runtimeResult = await removeTelegramRuntimeConfig(auth.appUser.id);

  if (!runtimeResult.updated) {
    const reason = "reason" in runtimeResult ? runtimeResult.reason : "unknown";
    return NextResponse.json(
      { error: `Failed to deactivate Telegram bot: ${reason}` },
      { status: 502 }
    );
  }

  const now = new Date().toISOString();
  const [{ error: userUpdateError }, { error: channelUpdateError }] = await Promise.all([
    supabase
      .from("users")
      .update({
        telegram_bot_token: null,
        telegram_bot_username: null,
        updated_at: now,
      })
      .eq("id", auth.appUser.id),
    supabase.from("user_channels").upsert(
      {
        user_id: auth.appUser.id,
        channel: "telegram",
        status: "disconnected",
        meta: {},
        updated_at: now,
      },
      { onConflict: "user_id,channel" }
    ),
  ]);

  if (userUpdateError) {
    return NextResponse.json({ error: userUpdateError.message }, { status: 500 });
  }

  if (channelUpdateError && channelUpdateError.code !== "42P01") {
    return NextResponse.json({ error: channelUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ disconnected: true });
}
