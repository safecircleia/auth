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
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <Grainient
            color1="#8b5cf6"
            color2="#6366f1"
            color3="#3b82f6"
            zoom={0.8}
            className="h-full w-full"
          />
        </div>
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
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
                  className="rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow"
                  size="lg"
                >
                  <IconSparkles className="mr-2 size-4" />
                  Upgrade to Pro
                </Button>
              )}
              <Link href="/dashboard/settings" as={undefined}>
                <Button
                  variant="outline"
                  className="rounded-full border-border/50 hover:border-border"
                  size="lg"
                >
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
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-border">
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
                      className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30"
                    >
                      <IconCheck className="mr-1 size-3" /> 2FA Enabled
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-red-500/30"
                    >
                      <IconAlertTriangle className="mr-1 size-3" /> 2FA Disabled
                    </Badge>
                  )}
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-5 dark:opacity-10">
                <IconShield className="size-24" />
              </div>
            </Card>

            {/* Subscription Status */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-border">
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
                      className="bg-violet-500/15 text-violet-600 dark:text-violet-400 hover:bg-violet-500/25 border-violet-500/30"
                    >
                      <IconSparkles className="mr-1 size-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="border-border/50">
                      Basic Features
                    </Badge>
                  )}
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-5 dark:opacity-10">
                <IconCreditCard className="size-24" />
              </div>
            </Card>

            {/* Sessions */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-border">
              <CardHeader className="pb-2">
                <CardDescription>Active Sessions</CardDescription>
                <CardTitle className="text-2xl">{activeSessions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/5"
                  >
                    <IconDevices className="mr-1 size-3" /> Devices
                  </Badge>
                </div>
              </CardContent>
              <div className="absolute right-4 top-4 opacity-5 dark:opacity-10">
                <IconDevices className="size-24" />
              </div>
            </Card>
          </div>

          <h2 className="text-lg font-semibold tracking-tight pt-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/dashboard/settings/security" className="block group">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-200">
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
          <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold text-primary ring-2 ring-primary/20">
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
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] border-border/50"
                  >
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                size="sm"
                asChild
              >
                <Link href="/dashboard/settings">Edit Details</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur-sm">
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
                className="w-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:border-border"
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
