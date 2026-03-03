import { NextResponse } from "next/server";

type EnvHealth = {
  ok: boolean;
  checkedAt: string;
  missing: {
    required: string[];
    requiredAnyOf: string[][];
  };
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL"] as const;
const REQUIRED_ANY_OF = [
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
] as const;

function isPresent(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const missingRequired = REQUIRED_ENV.filter((name) => !isPresent(process.env[name]));
  const missingAnyOfGroups = REQUIRED_ANY_OF.filter(
    (group) => !group.some((name) => isPresent(process.env[name]))
  );

  const body: EnvHealth = {
    ok: missingRequired.length === 0 && missingAnyOfGroups.length === 0,
    checkedAt: new Date().toISOString(),
    missing: {
      required: [...missingRequired],
      requiredAnyOf: missingAnyOfGroups.map((group) => [...group]),
    },
  };

  return NextResponse.json(body, {
    status: body.ok ? 200 : 500,
  });
}
