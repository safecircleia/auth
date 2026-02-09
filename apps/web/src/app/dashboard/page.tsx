import { redirect } from "next/navigation";

import { authServerClient } from "@/lib/auth-server";
import { DashboardOverview } from "@/components/dashboard/overview";

export default async function DashboardPage() {
  const { data: session } = await authServerClient.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { data: customerState } = await authServerClient.customer.state();

  return (
    <DashboardOverview
      user={session.user}
      session={session.session}
      customerState={customerState}
    />
  );
}
