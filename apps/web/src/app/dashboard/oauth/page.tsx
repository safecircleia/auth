import { OAuthApplications } from "@/components/oauth-applications";

export default function OAuthDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          OAuth Applications
        </h1>
        <p className="text-muted-foreground">
          Manage OAuth applications that can access your account
        </p>
      </div>
      <OAuthApplications />
    </div>
  );
}
