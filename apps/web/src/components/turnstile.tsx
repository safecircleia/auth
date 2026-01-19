"use client";

import Turnstile from "react-turnstile";
import { useEffect, useState } from "react";
import { getTurnstileSiteKey } from "@/app/actions";

interface TurnstileProps {
  onToken: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onToken, onError, onExpire }: TurnstileProps) {
  const [siteKey, setSiteKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTurnstileSiteKey()
      .then(setSiteKey)
      .catch((error) => {
        setIsLoading(false);
        onError?.(error);
      })
      .finally(() => setIsLoading(false));
  }, [onError]);

  if (isLoading) {
    return <div className="flex justify-center py-2">Loading...</div>;
  }

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        sitekey={siteKey}
        onSuccess={onToken}
        onError={onError}
        onExpire={onExpire}
      />
    </div>
  );
}
