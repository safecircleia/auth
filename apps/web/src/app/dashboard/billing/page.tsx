import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { BillingSettings } from "@/components/dashboard/settings/billing-settings";

export default async function BillingPage() {
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

  return <BillingSettings customerState={customerState} user={session.user} />;
}
