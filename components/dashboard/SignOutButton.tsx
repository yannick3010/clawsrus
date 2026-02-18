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
      className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-600 hover:border-navy-300"
    >
      Sign out
    </button>
  );
}
