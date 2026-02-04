"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import { OAuthProviders } from "./oauth-providers";
import Loader from "./loader";

type SignupStep = "form" | "verify";

export function SignupForm({ className }: { className?: string }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const [step, setStep] = useState<SignupStep>("form");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            setEmail(value.email);
            setStep("verify");
            toast.success("Account created! Please verify your email.");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z
          .string()
          .min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
        setOtp("");
      } else {
        toast.success("Email verified successfully!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Failed to verify email. Please try again.");
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to resend code");
      } else {
        toast.success("Verification code sent!");
        setOtp("");
      }
    } catch (err) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a verification code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <Field>
            <FieldLabel className="sr-only">Verification Code</FieldLabel>
            <InputOTP
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerifyOTP}
              disabled={isVerifying}
              autoFocus
            />
            <FieldDescription className="text-center mt-2">
              Enter the 6-digit code from your email
            </FieldDescription>
          </Field>

          <Field>
            <Button
              type="button"
              className="w-full"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </FieldDescription>

          <FieldDescription className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setOtp("");
              }}
              className="underline underline-offset-4 hover:text-primary"
            >
              ← Back to signup
            </button>
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder="John Doe"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                placeholder="m@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </Field>
          )}
        </form.Subscribe>

        <FieldSeparator>Or continue with</FieldSeparator>

        <OAuthProviders mode="signup" />

        <FieldDescription className="px-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="underline underline-offset-4">
            Sign in
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
