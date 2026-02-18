import { redirect } from "next/navigation";
import ChatPanel from "@/components/dashboard/ChatPanel";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import ChannelsPanel from "@/components/dashboard/ChannelsPanel";
import SkillsPanel from "@/components/dashboard/SkillsPanel";
import SignOutButton from "@/components/dashboard/SignOutButton";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-navy-50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-2xl tracking-tight text-navy-800">
              ClawsRUs Dashboard
            </p>
            <p className="text-sm text-navy-400">
              Welcome{auth.appUser.preferred_name ? `, ${auth.appUser.preferred_name}` : ""}.
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
        <ChatPanel />
        <aside className="space-y-6">
          <ProfileSettings />
          <ChannelsPanel />
          <SkillsPanel />
        </aside>
      </div>
    </main>
  );
}
