"use client";

import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm onSwitchToSignUp={() => {}} />
    </div>
  );
}
