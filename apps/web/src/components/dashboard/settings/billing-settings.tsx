"use client";

import {
  IconCheck,
  IconCreditCard,
  IconSparkles,
  IconArrowRight,
  IconReceipt,
  IconCalendar,
  IconX,
} from "@tabler/icons-react";

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
import { Separator } from "@/components/ui/separator";

interface BillingSettingsProps {
  customerState: Awaited<ReturnType<typeof authClient.customer.state>>["data"];
  user: typeof authClient.$Infer.Session.user;
}

const proFeatures = [
  "Unlimited API requests",
  "Priority support",
  "Advanced analytics",
  "Custom integrations",
  "Team collaboration",
  "SSO authentication",
];

const freeFeatures = [
  "1,000 API requests/month",
  "Community support",
  "Basic analytics",
  "Standard integrations",
];

export function BillingSettings({ customerState, user }: BillingSettingsProps) {
  const hasProSubscription = (customerState?.activeSubscriptions?.length ?? 0) > 0;
  const activeSubscription = customerState?.activeSubscriptions?.[0];

  const handleUpgrade = async () => {
    await authClient.checkout({ slug: "pro" });
  };

  const handleManageSubscription = async () => {
    await authClient.customer.portal();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCreditCard className="size-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-14 items-center justify-center rounded-full ${
                  hasProSubscription
                    ? "bg-primary/10"
                    : "bg-muted"
                }`}
              >
                {hasProSubscription ? (
                  <IconSparkles className="size-7 text-primary" />
                ) : (
                  <IconCreditCard className="size-7 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">
                    {hasProSubscription ? "Pro Plan" : "Free Plan"}
                  </h3>
                  {hasProSubscription && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasProSubscription
                    ? "All features unlocked with priority support"
                    : "Basic features with limited API access"}
                </p>
              </div>
            </div>
            {hasProSubscription && activeSubscription && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  $9.99
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
            )}
          </div>

          {hasProSubscription && activeSubscription && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <IconCalendar className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next billing date</p>
                  <p className="text-sm text-muted-foreground">
                    {activeSubscription.currentPeriodEnd
                      ? new Date(
                          activeSubscription.currentPeriodEnd
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <IconReceipt className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Billing cycle</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          {hasProSubscription ? (
            <Button variant="outline" onClick={handleManageSubscription}>
              Manage Subscription
              <IconArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button onClick={handleUpgrade}>
              <IconSparkles className="mr-2 size-4" />
              Upgrade to Pro
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Plan Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Free Plan */}
        <Card className={!hasProSubscription ? "border-primary/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              {!hasProSubscription && (
                <Badge variant="outline">Current Plan</Badge>
              )}
            </div>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <IconCheck className="size-4 text-primary" />
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconX className="size-4" />
                Team collaboration
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconX className="size-4" />
                SSO authentication
              </li>
            </ul>
          </CardContent>
          {hasProSubscription && (
            <CardFooter className="border-t pt-6">
              <Button variant="outline" className="w-full" disabled>
                Downgrade
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Pro Plan */}
        <Card
          className={
            hasProSubscription
              ? "border-primary/50"
              : "border-primary/30 bg-gradient-to-b from-primary/5 to-transparent"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IconSparkles className="size-5 text-primary" />
                Pro
              </CardTitle>
              {hasProSubscription && (
                <Badge variant="default">Current Plan</Badge>
              )}
            </div>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <IconCheck className="size-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          {!hasProSubscription && (
            <CardFooter className="border-t pt-6">
              <Button className="w-full" onClick={handleUpgrade}>
                <IconSparkles className="mr-2 size-4" />
                Upgrade to Pro
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Billing History */}
      {hasProSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access your complete billing history and download invoices from
              the customer portal.
            </p>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" onClick={handleManageSubscription}>
              <IconReceipt className="mr-2 size-4" />
              View Billing History
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Can I cancel my subscription anytime?</p>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your Pro subscription at any time. You'll
              continue to have access until the end of your current billing
              period.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">What happens when I upgrade?</p>
            <p className="text-sm text-muted-foreground">
              You'll get immediate access to all Pro features. We'll prorate
              your billing so you only pay for the time remaining in your
              current period.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Do you offer refunds?</p>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for new Pro subscriptions.
              Contact support if you're not satisfied.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
