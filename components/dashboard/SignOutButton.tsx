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
      className="text-[11px] text-ink-400 transition hover:text-ink-600"
    >
      Sign out
    </button>
  );
}
