import { redirect } from "next/navigation";

import { authServerClient } from "@/lib/auth-server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/animate-ui/components/radix/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await authServerClient.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={session.user} />
      <SidebarInset>
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
