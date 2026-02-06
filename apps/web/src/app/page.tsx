import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { HomePage } from "@/components/home-page";

export default async function Page() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return <HomePage />;
}
