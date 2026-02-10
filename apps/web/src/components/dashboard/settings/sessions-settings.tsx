"use client";

import { useState, useEffect } from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconLoader2,
  IconMapPin,
  IconClock,
  IconTrash,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/loader";

interface Session {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function SessionsSettings() {
  const { data: currentSession } = authClient.useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showIpAddress, setShowIpAddress] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data } = await authClient.listSessions();
      if (data) setSessions(data as Session[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      const { error } = await authClient.revokeSession({
        token: sessionToken,
      });

      if (error) {
        toast.error(error.message || "Failed to revoke session");
      } else {
        toast.success("Session revoked successfully");
        fetchSessions();
      }
    } catch (err) {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      const { error } = await authClient.revokeSessions();

      if (error) {
        toast.error(error.message || "Failed to revoke sessions");
      } else {
        toast.success("All other sessions have been revoked");
        fetchSessions();
      }
    } catch (err) {
      toast.error("Failed to revoke sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (userAgent?: string | null) => {
    if (!userAgent) return <IconDeviceDesktop className="size-5" />;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("iphone") ||
      ua.includes("android")
    ) {
      return <IconDeviceMobile className="size-5" />;
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return <IconDeviceTablet className="size-5" />;
    }
    return <IconDeviceDesktop className="size-5" />;
  };

  const getDeviceName = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown Device";

    const ua = userAgent.toLowerCase();

    // Detect browser
    let browser = "Browser";
    if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
      browser = "Safari";
    else if (ua.includes("edg")) browser = "Edge";
    else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

    // Detect OS
    let os = "";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

    return `${browser}${os ? ` on ${os}` : ""}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const blurIpAddress = (ip?: string | null) => {
    if (!ip) return "";
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***.`;
    }
    return ip.slice(0, 5) + "***";
  };

  if (isLoading) {
    return <Loader />;
  }

  const otherSessions = sessions?.filter(
    (s: Session) => s.token !== currentSession?.session.token,
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Active Sessions
        </h1>
        <p className="text-base text-muted-foreground">
          Manage devices where you're currently signed in
        </p>
      </div>

      {/* Current Session Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card/50 to-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Current Session</CardTitle>
              <CardDescription className="text-sm">
                The device you're using right now
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          {currentSession && (
            <div className="space-y-4">
              {/* Device Info */}
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {getDeviceIcon(currentSession.session.userAgent)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {getDeviceName(currentSession.session.userAgent)}
                  </p>
                  <Badge className="mt-2 gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">
                    <IconCheck className="size-3" />
                    Current
                  </Badge>
                </div>
              </div>

              <Separator className="bg-border/30" />

              {/* Session Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* IP Address */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <IconMapPin className="size-3.5 text-primary" />
                    IP Address
                  </p>
                  <div
                    className="text-sm text-foreground cursor-default"
                    onMouseEnter={() =>
                      setShowIpAddress(currentSession.session.ipAddress || null)
                    }
                    onMouseLeave={() => setShowIpAddress(null)}
                    title={currentSession.session.ipAddress || "Unknown"}
                  >
                    {showIpAddress === currentSession.session.ipAddress
                      ? currentSession.session.ipAddress || "Unknown"
                      : blurIpAddress(currentSession.session.ipAddress) ||
                        "Unknown"}
                  </div>
                </div>

                {/* Started */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <IconClock className="size-3.5 text-primary" />
                    Started
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(currentSession.session.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Sessions Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconDeviceDesktop className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Other Sessions</CardTitle>
                <CardDescription className="text-sm">
                  Sessions active on other devices
                </CardDescription>
              </div>
            </div>
            {otherSessions && otherSessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-lg"
                  >
                    Revoke All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <IconAlertTriangle className="size-5 text-destructive" />
                      Revoke All Sessions?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out from all other devices. You'll
                      remain signed in on this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeAllSessions}
                      disabled={isRevokingAll}
                    >
                      {isRevokingAll ? "Revoking..." : "Revoke All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          {!otherSessions || otherSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconDeviceDesktop className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                No other active sessions
              </p>
              <p className="text-sm text-muted-foreground">
                You're only signed in on this device
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherSessions.map((session: Session) => (
                <div
                  key={session.token}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-4 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {getDeviceName(session.userAgent)}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {session.ipAddress && (
                          <span className="flex items-center gap-1">
                            <IconMapPin className="size-3" />
                            <span
                              onMouseEnter={() =>
                                setShowIpAddress(session.ipAddress)
                              }
                              onMouseLeave={() => setShowIpAddress(null)}
                              title={session.ipAddress}
                              className="cursor-default"
                            >
                              {showIpAddress === session.ipAddress
                                ? session.ipAddress
                                : blurIpAddress(session.ipAddress)}
                            </span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <IconClock className="size-3" />
                          Last active {formatDate(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive flex-shrink-0 ml-2"
                        disabled={revokingId === session.token}
                      >
                        {revokingId === session.token ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconTrash className="size-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <IconAlertTriangle className="size-5 text-destructive" />
                          Revoke Session?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign you out from{" "}
                          {getDeviceName(session.userAgent)}. You'll need to
                          sign in again on that device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevokeSession(session.token)}
                        >
                          Revoke Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Info Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">About Sessions</CardTitle>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            A session is created every time you sign in to your account on a new
            device or browser. Sessions help keep you signed in and allow us to
            show you which devices have access to your account.
          </p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              🔒 Security Tips
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Regularly review your active sessions and revoke any you don't
                  recognize
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  If you see a session from an unfamiliar location, change your
                  password immediately
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Sign out from shared or public devices after use</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
