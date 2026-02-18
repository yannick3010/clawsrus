#!/usr/bin/env tsx

import {
  isRuntimeUnavailableError,
  resolveGatewayTargetForUser,
} from "../lib/docker-gateway-resolver";

type AppUserRow = {
  id: string;
  email: string;
  status: string;
  container_id: string | null;
};

const apply = process.argv.includes("--apply");
const baseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!baseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

async function supabaseFetch(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

async function listActiveUsers() {
  const res = await supabaseFetch(
    "/rest/v1/users?select=id,email,status,container_id&status=eq.active&order=updated_at.desc"
  );
  if (!res.ok) {
    throw new Error(`Failed fetching users: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as AppUserRow[];
}

async function markProvisionFailed(userId: string) {
  const res = await supabaseFetch(`/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "provision_failed",
      container_id: null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed updating ${userId}: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const users = await listActiveUsers();
  if (users.length === 0) {
    console.log("No active users found.");
    return;
  }

  let healthy = 0;
  let unhealthy = 0;

  for (const user of users) {
    const expectedContainerName = user.container_id || `clawsrus-${user.id}`;
    try {
      await resolveGatewayTargetForUser(user.id, {
        expectedContainerName,
        requireReachable: true,
        ttlMs: 0,
      });
      healthy += 1;
      console.log(`HEALTHY  ${user.id} (${user.email})`);
    } catch (error) {
      if (!isRuntimeUnavailableError(error)) {
        throw error;
      }

      unhealthy += 1;
      console.log(
        `UNHEALTHY ${user.id} (${user.email}) reason=${error.reason} container=${error.containerName}`
      );
      if (apply) {
        await markProvisionFailed(user.id);
        console.log(`  -> marked provision_failed and cleared container_id`);
      }
    }
  }

  console.log(
    `Done. healthy=${healthy} unhealthy=${unhealthy} mode=${
      apply ? "apply" : "dry-run"
    }`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
