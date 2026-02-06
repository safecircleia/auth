import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { ProfileSettings } from "@/components/dashboard/settings/profile-settings";

export default async function ProfileSettingsPage() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileSettings user={session.user} />;
}
