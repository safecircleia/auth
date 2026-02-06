import { Logo } from "@/components/logo";
import { SignupForm } from "../../components/signup-form";

const APP_VERSION = "0.1.0";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Logo size="sm" />
            SafeCircle Auth.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
        <p className="text-muted-foreground/60 text-center text-xs">
          SafeCircle Auth v{APP_VERSION}
        </p>
      </div>
      <div className="relative hidden lg:block">
        <img
          src="/background.png"
          alt="SafeCircle Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
