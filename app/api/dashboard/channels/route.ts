import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { ensureDefaultChannels, getChannelsForUser } from "@/lib/channel-utils";

export async function GET() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultChannels(auth.appUser.id);
  const channels = await getChannelsForUser(auth.appUser.id);

  return NextResponse.json(channels);
}
