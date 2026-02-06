import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { DashboardOverview } from "@/components/dashboard/overview";

export default async function DashboardPage() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { data: customerState } = await authClient.customer.state({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <DashboardOverview
      user={session.user}
      session={session.session}
      customerState={customerState}
    />
  );
}
