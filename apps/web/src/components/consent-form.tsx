"use client";

import { useEffect, useState } from "react";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Loader from "./loader";
import {
  IconShield,
  IconUser,
  IconMail,
  IconRefresh,
  IconKey,
  IconBuilding,
  IconShieldCheck,
  IconShieldX,
} from "@tabler/icons-react";

// Scope metadata for display
const SCOPE_INFO: Record<
  string,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    required?: boolean;
  }
> = {
  openid: {
    label: "OpenID",
    description: "Access your unique identifier",
    icon: <IconKey className="size-4" />,
    required: true,
  },
  profile: {
    label: "Profile",
    description: "Access your name and profile picture",
    icon: <IconUser className="size-4" />,
  },
  email: {
    label: "Email",
    description: "Access your email address",
    icon: <IconMail className="size-4" />,
  },
  offline_access: {
    label: "Offline Access",
    description: "Access your data when you're not using the app",
    icon: <IconRefresh className="size-4" />,
  },
  "read:organization": {
    label: "Organization Access",
    description: "Read your organization information",
    icon: <IconBuilding className="size-4" />,
  },
};

interface OAuthClientPublic {
  client_id: string;
  client_name?: string;
  logo_uri?: string;
  client_uri?: string;
}

export function ConsentForm({ className }: { className?: string }) {
  const searchParams = useSearchParams();

  const clientId = searchParams.get("client_id");
  const scopeParam = searchParams.get("scope");
  const requestedScopes = scopeParam?.split(" ") || [];

  const [client, setClient] = useState<OAuthClientPublic | null>(null);
  const [selectedScopes, setSelectedScopes] =
    useState<string[]>(requestedScopes);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"approved" | "denied" | null>(null);

  // Fetch client information
  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        const errorMessage = "No client ID provided";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await authClient.oauth2.publicClient({
          query: { client_id: clientId },
        });

        if (error) {
          const errorMessage =
            error.message || "Failed to fetch client information";
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (data) {
          setClient(data as unknown as OAuthClientPublic);
        }
      } catch (err) {
        const errorMessage = "Failed to load application information";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClient();
  }, [clientId]);

  // Initialize selected scopes with required ones always included
  useEffect(() => {
    const requiredScopes = requestedScopes.filter(
      (scope) => SCOPE_INFO[scope]?.required,
    );
    setSelectedScopes((prev) => {
      const combined = new Set([...prev, ...requiredScopes]);
      return Array.from(combined);
    });
  }, []);

  const handleScopeToggle = (scope: string, checked: boolean) => {
    // Don't allow unchecking required scopes
    if (SCOPE_INFO[scope]?.required) return;

    setSelectedScopes((prev) =>
      checked ? [...prev, scope] : prev.filter((s) => s !== scope),
    );
  };

  const handleConsent = async (accept: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await authClient.oauth2.consent({
        accept,
        scope: accept ? selectedScopes.join(" ") : undefined,
      });

      if (error) {
        const errorMessage = error.message || "Failed to process consent";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Show success state before redirect
      setResult(accept ? "approved" : "denied");
      toast.success(accept ? "Access granted!" : "Access denied");

      // The plugin will handle the redirect automatically
      if (data?.redirect && data?.uri) {
        window.location.href = data.uri;
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader />
        <p className="text-muted-foreground text-sm">
          Loading application info...
        </p>
      </div>
    );
  }

  // Success/Result state
  if (result) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-full",
                result === "approved"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {result === "approved" ? (
                <IconShieldCheck className="size-8" />
              ) : (
                <IconShieldX className="size-8" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {result === "approved" ? "Access Granted" : "Access Denied"}
            </h1>
            <p className="text-muted-foreground text-sm text-balance">
              {result === "approved"
                ? "Redirecting you back to the application..."
                : "You have denied access to this application."}
            </p>
          </div>

          <FieldDescription className="text-center">
            <Loader />
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  // Error state without client
  if (error && !client) {
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
            <Button variant="outline" className="w-full" asChild>
              <a href="/">Return Home</a>
            </Button>
          </Field>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-3 text-center">
          {client?.logo_uri ? (
            <img
              src={client.logo_uri}
              alt={client.client_name || "Application"}
              className="size-16 rounded-xl"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
              <IconShield className="size-8 text-muted-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-bold">Authorize Access</h1>
          <p className="text-muted-foreground text-sm text-balance">
            <span className="font-medium text-foreground">
              {client?.client_name || "An application"}
            </span>{" "}
            wants to access your account
          </p>
          {client?.client_uri && (
            <a
              href={client.client_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              {new URL(client.client_uri).hostname}
            </a>
          )}
        </div>

        <FieldSeparator>Requested permissions</FieldSeparator>

        <div className="space-y-3">
          {requestedScopes.map((scope) => {
            const scopeInfo = SCOPE_INFO[scope] || {
              label: scope,
              description: `Access to ${scope}`,
              icon: <IconKey className="size-4" />,
            };

            const isRequired = scopeInfo.required;
            const isSelected = selectedScopes.includes(scope);

            return (
              <div
                key={scope}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <Checkbox
                  id={scope}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleScopeToggle(scope, checked as boolean)
                  }
                  disabled={isRequired || isSubmitting}
                  className="mt-0.5"
                />
                <label
                  htmlFor={scope}
                  className="flex-1 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    {scopeInfo.icon}
                    <span className="text-sm font-medium">
                      {scopeInfo.label}
                    </span>
                    {isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scopeInfo.description}
                  </p>
                </label>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleConsent(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Deny"}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleConsent(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authorizing..." : "Authorize"}
          </Button>
        </div>

        <FieldDescription className="text-center">
          By authorizing, you agree to allow this application to use your
          information in accordance with their terms of service.
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
