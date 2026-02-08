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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import Loader from "./loader";

type VerifyMethod = "totp" | "backup";

export function TwoFactorForm({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { data: session, isPending } = authClient.useSession();

  const [method, setMethod] = useState<VerifyMethod>("totp");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);

  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: totpCode,
        trustDevice,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
        setTotpCode("");
      } else if (data) {
        toast.success("Verification successful!");
        window.location.href = callbackUrl;
      }
    } catch (err) {
      toast.error("Failed to verify code. Please try again.");
      setTotpCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!backupCode.trim()) {
      toast.error("Please enter a backup code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyBackupCode({
        code: backupCode.trim(),
        trustDevice,
      });

      if (error) {
        toast.error(error.message || "Invalid backup code");
        setBackupCode("");
      } else if (data) {
        toast.success("Verification successful!");
        window.location.href = callbackUrl;
      }
    } catch (err) {
      toast.error("Failed to verify backup code. Please try again.");
      setBackupCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  // Redirect fully authenticated users to dashboard
  // (users with completed 2FA verification already have a valid session)
  useEffect(() => {
    if (session?.user && !isPending) {
      // User is fully authenticated, redirect to callback URL
      window.location.href = callbackUrl;
    }
  }, [session, isPending, callbackUrl]);

  if (isPending || session?.user) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (method === "backup") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Use backup code</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter one of your backup codes to sign in
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="backupCode">Backup Code</FieldLabel>
            <Input
              id="backupCode"
              type="text"
              placeholder="Enter backup code"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              className="font-mono"
              autoFocus
            />
            <FieldDescription>
              Each backup code can only be used once
            </FieldDescription>
          </Field>

          <Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <span className="text-muted-foreground">
                Trust this device for 30 days
              </span>
            </label>
          </Field>

          <Field>
            <Button
              type="button"
              className="w-full"
              onClick={handleVerifyBackupCode}
              disabled={!backupCode.trim() || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Backup Code"}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            <button
              type="button"
              onClick={() => {
                setMethod("totp");
                setBackupCode("");
              }}
              className="underline underline-offset-4 hover:text-primary"
            >
              ← Use authenticator app instead
            </button>
          </FieldDescription>

          <FieldDescription className="text-center">
            <a
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Back to login
            </a>
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Two-factor authentication</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Field>
          <FieldLabel className="sr-only">Verification Code</FieldLabel>
          <InputOTP
            length={6}
            value={totpCode}
            onChange={setTotpCode}
            onComplete={handleVerifyTotp}
            disabled={isVerifying}
            autoFocus
          />
          <FieldDescription className="text-center mt-2">
            Open your authenticator app to view your code
          </FieldDescription>
        </Field>

        <Field>
          <label className="flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <span className="text-muted-foreground">
              Trust this device for 30 days
            </span>
          </label>
        </Field>

        <Field>
          <Button
            type="button"
            className="w-full"
            onClick={handleVerifyTotp}
            disabled={totpCode.length !== 6 || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Lost access to your authenticator?{" "}
          <button
            type="button"
            onClick={() => setMethod("backup")}
            className="underline underline-offset-4 hover:text-primary"
          >
            Use a backup code
          </button>
        </FieldDescription>

        <FieldDescription className="text-center">
          <a
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Back to login
          </a>
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
