"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconCreditCard,
  IconShield,
  IconDevices,
  IconKey,
  IconArrowRight,
  IconSparkles,
  IconCheck,
  IconAlertTriangle,
  IconFingerprint,
} from "@tabler/icons-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/utils/trpc";
import Grainient from "@/components/Grainient";

interface DashboardOverviewProps {
  user: typeof authClient.$Infer.Session.user;
  session: typeof authClient.$Infer.Session.session;
  customerState: Awaited<ReturnType<typeof authClient.customer.state>>["data"];
}

export function DashboardOverview({
  user,
  session,
  customerState,
}: DashboardOverviewProps) {
  const privateData = useQuery(trpc.privateData.queryOptions());

  const [sessions, setSessions] = useState<unknown[]>([]);

  useEffect(() => {
    authClient.listSessions().then(({ data }) => {
      if (data) setSessions(data);
    });
  }, []);

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;
  const activeSessions = sessions?.length ?? 1;
  const isTwoFactorEnabled = (user as any)?.twoFactorEnabled ?? false;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-background border shadow-sm">
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <Grainient
            color1="#6366f1"
            color2="#ec4899"
            color3="#a855f7"
            zoom={0.8}
            className="h-full w-full"
          />
        </div>
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="text-muted-foreground max-w-lg text-base">
                Your account is{" "}
                {isTwoFactorEnabled ? "secure" : "mostly secure"}.
                {hasProSubscription
                  ? " You have full access to all premium features."
                  : " Upgrade to Pro to unlock the full potential of SafeCircle."}
              </p>
            </div>
            <div className="flex gap-3">
              {!hasProSubscription && (
                <Button
                  onClick={async () =>
                    await authClient.checkout({ slug: "pro" })
                  }
                  className="rounded-full shadow-lg shadow-primary/20"
                  size="lg"
                >
                  <IconSparkles className="mr-2 size-4" />
                  Upgrade to Pro
                </Button>
              )}
              <Link href="/dashboard/settings" as={undefined}>
                <Button variant="outline" className="rounded-full" size="lg">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions / Status */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight">Overview</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Security Status */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>Security Status</CardDescription>
                <CardTitle className="text-2xl">
                  {isTwoFactorEnabled ? "Protected" : "At Risk"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  {isTwoFactorEnabled ? (
                    <Badge
                      variant="default"
                      className="bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-green-500/20"
                    >
                      <IconCheck className="mr-1 size-3" /> 2FA Enabled
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 border-red-500/20"
                    >
                      <IconAlertTriangle className="mr-1 size-3" /> 2FA Disabled
                    </Badge>
                  )}
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-10">
                <IconShield className="size-24" />
              </div>
            </Card>

            {/* Subscription Status */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>Current Plan</CardDescription>
                <CardTitle className="text-2xl">
                  {hasProSubscription ? "Pro Plan" : "Free Plan"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  {hasProSubscription ? (
                    <Badge
                      variant="default"
                      className="bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/20"
                    >
                      <IconSparkles className="mr-1 size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Basic Features</Badge>
                  )}
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-10">
                <IconCreditCard className="size-24" />
              </div>
            </Card>

            {/* Sessions */}
            <Card className="relative overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>Active Sessions</CardDescription>
                <CardTitle className="text-2xl">{activeSessions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-primary/20">
                    <IconDevices className="mr-1 size-3" /> Devices
                  </Badge>
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-10">
                <IconDevices className="size-24" />
              </div>
            </Card>
          </div>

          <h2 className="text-lg font-semibold tracking-tight pt-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/dashboard/settings/security" className="block group">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <IconShield className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Security Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      Manage password & 2FA
                    </p>
                  </div>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard/settings/sessions" className="block group">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <IconDevices className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Sessions</h3>
                    <p className="text-xs text-muted-foreground">
                      Review active devices
                    </p>
                  </div>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block group">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <IconFingerprint className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Update your information
                    </p>
                  </div>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <div
              className="block group cursor-pointer"
              onClick={async () => {
                if (hasProSubscription) await authClient.customer.portal();
                else await authClient.checkout({ slug: "pro" });
              }}
            >
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <IconCreditCard className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Billing & Plan</h3>
                    <p className="text-xs text-muted-foreground">
                      {hasProSubscription
                        ? "Manage subscription"
                        : "Upgrade to Pro"}
                    </p>
                  </div>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Extra Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Account Details
          </h2>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                asChild
              >
                <Link href="/dashboard/settings">Edit Details</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Check out our documentation or contact support if you run into
                any issues.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-background"
              >
                Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
