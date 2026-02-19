"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={() => void signOut()}
      className="focus-ring rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:border-ink-300"
    >
      Sign out
    </button>
  );
}
