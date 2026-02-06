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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and authentication methods
        </p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="size-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            A summary of your account security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <IconLock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Set</p>
                </div>
              </div>
              <Badge variant="default">
                <IconCheck className="mr-1 size-3" />
                Secure
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <IconShield className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">
                    {isTwoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <Badge variant={isTwoFactorEnabled ? "default" : "secondary"}>
                {isTwoFactorEnabled ? "On" : "Off"}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <Badge
                variant={session?.user.emailVerified ? "default" : "secondary"}
              >
                {session?.user.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="currentPassword">
                Current Password
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <FieldDescription>
                Password must be at least 8 characters long
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>

            {passwordError && <FieldError>{passwordError}</FieldError>}
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleChangePassword} disabled={isChangingPassword}>
            {isChangingPassword ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <CardTitle>Session Security</CardTitle>
          <CardDescription>
            Manage your active sessions and sign out from other devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you suspect unauthorized access to your account, you can sign out
            from all other devices. This will require you to sign in again on
            those devices.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Sign Out All Other Sessions</Button>
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
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
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
