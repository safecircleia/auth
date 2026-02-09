import { redirect } from "next/navigation";

import { authServerClient } from "@/lib/auth-server";
import { BillingSettings } from "@/components/dashboard/settings/billing-settings";

export default async function BillingPage() {
  const { data: session } = await authServerClient.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { data: customerState } = await authServerClient.customer.state();

  return <BillingSettings customerState={customerState} user={session.user} />;
}
