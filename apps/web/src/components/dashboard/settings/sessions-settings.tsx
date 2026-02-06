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

  if (isLoading) {
    return <Loader />;
  }

  const otherSessions = sessions?.filter(
    (s: Session) => s.token !== currentSession?.session.token,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground">
          Manage devices where you're currently signed in
        </p>
      </div>

      {/* Current Session */}
      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
          <CardDescription>
            This is the device you're currently using
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSession && (
            <div className="flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                {getDeviceIcon(currentSession.session.userAgent)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {getDeviceName(currentSession.session.userAgent)}
                  </p>
                  <Badge variant="default" className="gap-1">
                    <IconCheck className="size-3" />
                    Current
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {currentSession.session.ipAddress && (
                    <span className="flex items-center gap-1">
                      <IconMapPin className="size-3" />
                      {currentSession.session.ipAddress}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <IconClock className="size-3" />
                    Started {formatDate(currentSession.session.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Other Sessions</CardTitle>
              <CardDescription>
                Sessions active on other devices
              </CardDescription>
            </div>
            {otherSessions && otherSessions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
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
        <CardContent>
          {!otherSessions || otherSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconDeviceDesktop className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No other active sessions</p>
              <p className="text-sm text-muted-foreground">
                You're only signed in on this device
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherSessions.map((session: Session) => (
                <div
                  key={session.token}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getDeviceName(session.userAgent)}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {session.ipAddress && (
                          <span className="flex items-center gap-1">
                            <IconMapPin className="size-3" />
                            {session.ipAddress}
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
                        className="text-destructive hover:text-destructive"
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

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A session is created every time you sign in to your account on a new
            device or browser. Sessions help keep you signed in and allow us to
            show you which devices have access to your account.
          </p>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Security Tips</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                Regularly review your active sessions and revoke any you don't
                recognize
              </li>
              <li>
                If you see a session from an unfamiliar location, change your
                password immediately
              </li>
              <li>Sign out from shared or public devices after use</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
