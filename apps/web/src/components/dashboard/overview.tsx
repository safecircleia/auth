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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your account security and subscription status.
        </p>
      </div>

      {/* Subscription Banner */}
      {!hasProSubscription && (
        <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-primary/10">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <IconSparkles className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock advanced features and priority support
                </p>
              </div>
            </div>
            <Button
              onClick={async () => await authClient.checkout({ slug: "pro" })}
            >
              Upgrade Now
              <IconArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Subscription Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <IconCreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {hasProSubscription ? "Pro" : "Free"}
              </span>
              {hasProSubscription && <Badge variant="default">Active</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasProSubscription
                ? "All features unlocked"
                : "Basic features only"}
            </p>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <IconShield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {isTwoFactorEnabled ? "Strong" : "Basic"}
              </span>
              <Badge variant={isTwoFactorEnabled ? "default" : "secondary"}>
                {isTwoFactorEnabled ? "2FA On" : "2FA Off"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isTwoFactorEnabled
                ? "Two-factor authentication enabled"
                : "Enable 2FA for better security"}
            </p>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <IconDevices className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active device{activeSessions !== 1 ? "s" : ""} logged in
            </p>
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <IconKey className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {user.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {user.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant={isTwoFactorEnabled ? "default" : "outline"}>
                {isTwoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Password</span>
              <Badge variant="outline">Set</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href={"/dashboard/settings/security" as any}
              className="w-full"
              prefetch={false}
            >
              <Button variant="outline" className="w-full">
                Manage Security
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Sessions</CardTitle>
            <CardDescription>
              View and manage your active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {activeSessions} active session
              {activeSessions !== 1 ? "s" : ""} across your devices.
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href={"/dashboard/settings/sessions" as any}
              className="w-full"
              prefetch={false}
            >
              <Button variant="outline" className="w-full">
                View Sessions
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {hasProSubscription
                ? "You're on the Pro plan with all features unlocked."
                : "Upgrade to Pro for advanced features and priority support."}
            </p>
          </CardContent>
          <CardFooter>
            {hasProSubscription ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => await authClient.customer.portal()}
              >
                Manage Subscription
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={async () => await authClient.checkout({ slug: "pro" })}
              >
                Upgrade to Pro
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Full Name
              </dt>
              <dd className="text-sm mt-1">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email Address
              </dt>
              <dd className="text-sm mt-1">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Account Created
              </dt>
              <dd className="text-sm mt-1">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Account Status
              </dt>
              <dd className="text-sm mt-1">
                <Badge variant="default">Active</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter>
          <Link href={"/dashboard/settings" as any} prefetch={false}>
            <Button variant="outline">
              Edit Profile
              <IconArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
