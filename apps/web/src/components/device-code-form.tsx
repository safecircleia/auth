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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Loader from "./loader";

export function DeviceCodeForm({ className }: { className?: string }) {
  const searchParams = useSearchParams();

  // Check if user_code is provided in URL (from verification_uri_complete)
  const urlUserCode = searchParams.get("user_code");

  const [userCode, setUserCode] = useState(urlUserCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(!!urlUserCode);
  const [error, setError] = useState<string | null>(null);

  // Format the code with a dash in the middle for display (e.g., ABCD-1234)
  const formatCodeForDisplay = (code: string) => {
    const cleaned = code.replace(/-/g, "").toUpperCase();
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    }
    return cleaned;
  };

  // Clean the code for API submission
  const cleanCode = (code: string) => {
    return code.replace(/-/g, "").toUpperCase();
  };

  // Auto-validate if code is provided in URL
  useEffect(() => {
    if (urlUserCode) {
      validateCode(cleanCode(urlUserCode));
    }
  }, [urlUserCode]);

  const validateCode = async (code: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const { data, error: apiError } = await authClient.device({
        query: { user_code: code },
      });

      if (apiError || !data) {
        const errorMessage =
          apiError?.error_description ||
          "Invalid or expired code. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsValidating(false);
        return;
      }

      // Code is valid, redirect to approval page
      toast.success("Code verified! Redirecting...");
      window.location.href = `/device/approve?user_code=${code}`;
    } catch (err) {
      const errorMessage = "Failed to verify code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setError(null);

    const formattedCode = cleanCode(userCode);

    if (formattedCode.length < 8) {
      setError("Please enter a complete device code");
      setIsLoading(false);
      return;
    }

    await validateCode(formattedCode);
    setIsLoading(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow alphanumeric characters and dashes
    const cleaned = input.replace(/[^A-Za-z0-9-]/g, "");
    setUserCode(formatCodeForDisplay(cleaned));
    setError(null);
  };

  if (isValidating && urlUserCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-muted-foreground text-sm">
          Verifying device code...
        </p>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Enter Device Code</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the code displayed on your device to authorize access
          </p>
        </div>

        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="user-code">Device Code</FieldLabel>
          <Input
            id="user-code"
            name="user-code"
            type="text"
            placeholder="ABCD-1234"
            value={userCode}
            onChange={handleCodeChange}
            maxLength={9}
            className="text-center text-2xl tracking-widest font-mono uppercase"
            autoComplete="off"
            autoFocus
            disabled={isLoading}
          />
          {error && <FieldError>{error}</FieldError>}
          <FieldDescription className="text-center">
            The code should look like: ABCD-1234
          </FieldDescription>
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || cleanCode(userCode).length < 8}
          >
            {isLoading ? "Verifying..." : "Continue"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Changed your mind?{" "}
          <a href="/" className="underline underline-offset-4">
            Return home
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
