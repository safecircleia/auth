import { redirect } from "next/navigation";

import { authServerClient } from "@/lib/auth-server";
import { HomePage } from "@/components/home-page";

export default async function Page() {
  const { data: session } = await authServerClient.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <HomePage />;
}
