import { redirect } from "next/navigation";

import { authServerClient } from "@/lib/auth-server";
import { ProfileSettings } from "@/components/dashboard/settings/profile-settings";

export default async function ProfileSettingsPage() {
  const { data: session } = await authServerClient.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileSettings user={session.user} />;
}
