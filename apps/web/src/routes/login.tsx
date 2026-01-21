import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  // Keep both forms mounted so the Turnstile widget isn't destroyed when toggling tabs.
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");

  return (
    <div>
      <div className={activeTab === "signin" ? "block" : "hidden"}>
        <SignInForm onSwitchToSignUp={() => setActiveTab("signup")} />
      </div>
      <div className={activeTab === "signup" ? "block" : "hidden"}>
        <SignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />
      </div>
    </div>
  );
}
