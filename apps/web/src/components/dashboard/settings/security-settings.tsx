"use client";

import { useState } from "react";
import {
  IconCheck,
  IconLoader2,
  IconLock,
  IconShield,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export function SecuritySettings() {
  const { data: session } = authClient.useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRevokingAllSessions, setIsRevokingAllSessions] = useState(false);
  const isTwoFactorEnabled = (session?.user as any)?.twoFactorEnabled ?? false;

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    setIsRevokingAllSessions(true);
    try {
      const { error } = await authClient.revokeSessions();

      if (error) {
        toast.error(error.message || "Failed to revoke sessions");
      } else {
        toast.success("All other sessions have been revoked");
      }
    } catch (err) {
      toast.error("Failed to revoke sessions");
    } finally {
      setIsRevokingAllSessions(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Security Settings
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your account security and authentication methods
        </p>
      </div>

      {/* Security Overview */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card/50 to-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Security Overview</CardTitle>
              <CardDescription className="text-sm">
                A summary of your account security status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Password Status */}
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconLock className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Password</p>
                  <p className="text-xs text-muted-foreground">Set</p>
                </div>
              </div>
              <Badge className="w-fit gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">
                <IconCheck className="size-3" />
                Secure
              </Badge>
            </div>

            {/* Two-Factor Auth Status */}
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconShield className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">
                    {isTwoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <Badge
                className={`w-fit gap-1 ${
                  isTwoFactorEnabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {isTwoFactorEnabled ? "On" : "Off"}
              </Badge>
            </div>

            {/* Email Verified Status */}
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconCheck className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Email Verified</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <Badge
                className={`w-fit gap-1 ${
                  session?.user.emailVerified
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {session?.user.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconLock className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription className="text-sm">
                Update your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6 space-y-6">
          {/* Current Password */}
          <Field className="space-y-3">
            <FieldLabel
              htmlFor="currentPassword"
              className="text-sm font-semibold"
            >
              Current Password
            </FieldLabel>
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50"
            />
          </Field>

          {/* New Password */}
          <Field className="space-y-3">
            <FieldLabel htmlFor="newPassword" className="text-sm font-semibold">
              New Password
            </FieldLabel>
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50"
            />
            <FieldDescription className="text-xs">
              Password must be at least 8 characters long
            </FieldDescription>
          </Field>

          {/* Confirm Password */}
          <Field className="space-y-3">
            <FieldLabel
              htmlFor="confirmPassword"
              className="text-sm font-semibold"
            >
              Confirm New Password
            </FieldLabel>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50"
            />
          </Field>

          {/* Error Message */}
          {passwordError && (
            <FieldError className="text-sm bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              {passwordError}
            </FieldError>
          )}
        </CardContent>
        <Separator className="bg-border/30" />
        <div className="px-6 py-4 bg-card/30 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <p className="text-xs text-muted-foreground hidden sm:block">
            This will revoke all other sessions for security
          </p>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {isChangingPassword ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 size-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Session Security */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Session Security</CardTitle>
              <CardDescription className="text-sm">
                Manage your active sessions and sign out from other devices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            If you suspect unauthorized access to your account, you can sign out
            from all other devices. This will require you to sign in again on
            those devices.
          </p>
        </CardContent>
        <Separator className="bg-border/30" />
        <div className="px-6 py-4 bg-card/30 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto rounded-lg"
              >
                Sign Out All Other Sessions
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="size-5 text-destructive" />
                  Sign Out All Sessions?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all devices except this one. You
                  will need to sign in again on those devices.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRevokeAllSessions}
                  disabled={isRevokingAllSessions}
                >
                  {isRevokingAllSessions ? "Signing out..." : "Sign Out All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-gradient-to-br from-destructive/5 via-card/50 to-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-destructive">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-sm">
                Irreversible actions that affect your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-destructive/30" />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-semibold text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-lg flex-shrink-0"
                >
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <IconAlertTriangle className="size-5 text-destructive" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        const { error } = await authClient.deleteUser();
                        if (error) {
                          toast.error(
                            error.message || "Failed to delete account",
                          );
                        } else {
                          toast.success("Account deleted");
                          window.location.href = "/";
                        }
                      } catch {
                        toast.error("Failed to delete account");
                      }
                    }}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
