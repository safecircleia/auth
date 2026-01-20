import { useEffect, useRef, useState } from "react";
import { getTurnstileSiteKey } from "@/actions";

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    turnstileLoaded?: boolean;
  }
}

interface TurnstileProps {
  onToken: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
}

// Load script once globally
const loadTurnstileScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.turnstile && window.turnstileLoaded) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.turnstileLoaded = true;
        resolve();
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.turnstileLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Failed to load Turnstile script"));
    };

    document.head.appendChild(script);
  });
};

export function TurnstileWidget({ onToken, onError, onExpire, theme = "auto" }: TurnstileProps) {
  const [siteKey, setSiteKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    getTurnstileSiteKey()
      .then(setSiteKey)
      .catch((error) => {
        console.error("Failed to get Turnstile site key:", error);
        setIsLoading(false);
        onError?.();
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    loadTurnstileScript()
      .then(() => setScriptLoaded(true))
      .catch((error) => {
        console.error("Failed to load Turnstile:", error);
        onError?.();
      });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !containerRef.current || isRenderedRef.current) return;

    if (window.turnstile) {
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onToken,
          "error-callback": onError,
          "expired-callback": onExpire,
          theme,
        });
        isRenderedRef.current = true;
      } catch (error) {
        console.error("Failed to render Turnstile:", error);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error("Failed to remove Turnstile:", error);
        }
        widgetIdRef.current = null;
        isRenderedRef.current = false;
      }
    };
  }, [siteKey, scriptLoaded]);

  if (isLoading) {
    return <div className="flex justify-center py-2">Loading verification...</div>;
  }

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
