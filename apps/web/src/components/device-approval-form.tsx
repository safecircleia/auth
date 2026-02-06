"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import Loader from "./loader";
import {
  IconCheck,
  IconX,
  IconShieldCheck,
  IconShieldX,
} from "@tabler/icons-react";

interface DeviceInfo {
  client_id?: string;
  scope?: string;
}

export function DeviceApprovalForm({ className }: { className?: string }) {
  const searchParams = useSearchParams();

  const userCode = searchParams.get("user_code");

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<"approved" | "denied" | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication and fetch device info
  useEffect(() => {
    async function initialize() {
      if (!userCode) {
        setError("No device code provided");
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is authenticated
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Verify the device code is still valid
        const { data, error: apiError } = await authClient.device({
          query: { user_code: userCode },
        });

        if (apiError || !data) {
          const errorMessage =
            "This device code is invalid or has expired. Please request a new code on your device.";
          setError(errorMessage);
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }

        // The API returns user_code and status, we store what we need
        setDeviceInfo({
          client_id: undefined,
          scope: undefined,
        });
      } catch (err) {
        setError("Failed to load device information");
        toast.error("Failed to load device information");
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [userCode]);

  const handleApprove = async () => {
    if (!userCode) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { error: apiError } = await authClient.device.approve({
        userCode: userCode,
      });

      if (apiError) {
        const errorMessage =
          apiError.error_description || "Failed to approve device";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      setSuccess("approved");
      toast.success("Device authorized successfully!");
    } catch (err) {
      const errorMessage = "Failed to approve device. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!userCode) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { error: apiError } = await authClient.device.deny({
        userCode: userCode,
      });

      if (apiError) {
        const errorMessage =
          apiError.error_description || "Failed to deny device";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      setSuccess("denied");
      toast.success("Device authorization denied");
    } catch (err) {
      const errorMessage = "Failed to deny device. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  // Format the user code for display
  const formatUserCode = (code: string | null) => {
    if (!code) return "";
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-muted-foreground text-sm">Loading device info...</p>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (isAuthenticated === false) {
    const loginUrl = `/login?redirect=${encodeURIComponent(`/device/approve?user_code=${userCode}`)}`;

    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground text-sm text-balance">
              You need to sign in to authorize this device
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-muted-foreground text-xs mb-1">Device Code</p>
            <p className="text-2xl font-mono font-bold tracking-widest">
              {formatUserCode(userCode)}
            </p>
          </div>

          <Field>
            <Button className="w-full" asChild>
              <a href={loginUrl}>Sign In to Continue</a>
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Changed your mind?{" "}
            <a href="/" className="underline underline-offset-4">
              Return home
            </a>
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-full",
                success === "approved"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {success === "approved" ? (
                <IconShieldCheck className="size-8" />
              ) : (
                <IconShieldX className="size-8" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {success === "approved" ? "Device Authorized" : "Device Denied"}
            </h1>
            <p className="text-muted-foreground text-sm text-balance">
              {success === "approved"
                ? "The device has been authorized and can now access your account."
                : "The device authorization request has been denied."}
            </p>
          </div>

          <FieldSeparator />

          <FieldDescription className="text-center">
            You can now close this window and return to your device.
          </FieldDescription>

          <Field>
            <Button variant="outline" className="w-full" asChild>
              <a href="/">Return Home</a>
            </Button>
          </Field>
        </FieldGroup>
      </div>
    );
  }

  // Error state without device info
  if (error && !deviceInfo) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <IconShieldX className="size-8" />
            </div>
            <h1 className="text-2xl font-bold">Authorization Error</h1>
            <p className="text-muted-foreground text-sm text-balance">
              {error}
            </p>
          </div>

          <Field>
            <Button className="w-full" asChild>
              <a href="/device">Try Again</a>
            </Button>
          </Field>

          <FieldDescription className="text-center">
            <a href="/" className="underline underline-offset-4">
              Return home
            </a>
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  // Main approval form
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Authorize Device</h1>
          <p className="text-muted-foreground text-sm text-balance">
            A device is requesting access to your account
          </p>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Device Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest">
            {formatUserCode(userCode)}
          </p>
        </div>

        {deviceInfo?.client_id && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Application</p>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="font-medium">{deviceInfo.client_id}</p>
            </div>
          </div>
        )}

        {deviceInfo?.scope && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Requested Permissions</p>
            <div className="flex flex-wrap gap-2">
              {deviceInfo.scope.split(" ").map((scope) => (
                <Badge key={scope} variant="secondary">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <FieldSeparator>Confirm your decision</FieldSeparator>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDeny}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <IconX className="size-4 mr-2" />
                Deny
              </>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={handleApprove}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <IconCheck className="size-4 mr-2" />
                Approve
              </>
            )}
          </Button>
        </div>

        <FieldDescription className="text-center">
          Make sure you recognize this device code.
          <br />
          If you didn&apos;t request this, click Deny.
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
