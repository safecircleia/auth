"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ClientInfo {
  name?: string;
  uri?: string;
  icon?: string;
}

export default function ConsentPage() {
  const searchParams = useSearchParams();
  const [scopes, setScopes] = useState<string[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const clientId = searchParams.get("client_id");
  const requestedScopes = searchParams.get("scope")?.split(" ") || [];

  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!clientId) return;

      try {
        const { data } = await authClient.oauth2.publicClient({
          client_id: clientId,
        });

        if (data) {
          setClientInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch client info:", error);
      }
    };

    fetchClientInfo();
    setScopes(requestedScopes);
    setSelectedScopes(new Set(requestedScopes));
  }, [clientId, requestedScopes]);

  const handleScopeToggle = (scope: string) => {
    const newScopes = new Set(selectedScopes);
    if (newScopes.has(scope)) {
      newScopes.delete(scope);
    } else {
      newScopes.add(scope);
    }
    setSelectedScopes(newScopes);
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await authClient.oauth2.consent({
        accept: true,
        scope: Array.from(selectedScopes).join(" "),
      });
    } catch (error) {
      console.error("Failed to accept consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    try {
      await authClient.oauth2.consent({
        accept: false,
      });
    } catch (error) {
      console.error("Failed to deny consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {clientInfo?.icon && (
            <img
              src={clientInfo.icon}
              alt={clientInfo.name || "Client"}
              className="w-12 h-12 rounded-lg mb-4"
            />
          )}

          <h1 className="text-2xl font-bold mb-2">
            {clientInfo?.name || "Application"} is requesting access
          </h1>

          <p className="text-muted-foreground mb-6">
            This application wants to access the following information from your account:
          </p>

          <div className="space-y-3 mb-6">
            {scopes.map((scope) => (
              <div key={scope} className="flex items-center space-x-2">
                <Checkbox
                  id={scope}
                  checked={selectedScopes.has(scope)}
                  onCheckedChange={() => handleScopeToggle(scope)}
                  disabled={isLoading}
                />
                <label
                  htmlFor={scope}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {formatScope(scope)}
                </label>
              </div>
            ))}
          </div>

          {clientInfo?.uri && (
            <p className="text-xs text-muted-foreground mb-6">
              Learn more:{" "}
              <a href={clientInfo.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {clientInfo.uri}
              </a>
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isLoading}
              className="flex-1"
            >
              Deny
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading || selectedScopes.size === 0}
              className="flex-1"
            >
              {isLoading ? "Loading..." : "Allow"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function formatScope(scope: string): string {
  const scopeLabels: Record<string, string> = {
    openid: "Identify you",
    profile: "Access your profile information",
    email: "Access your email address",
    offline_access: "Keep you signed in",
  };
  return scopeLabels[scope] || scope;
}
