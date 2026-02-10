"use client";

import { useState, useEffect } from "react";
import {
  IconFingerprint,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconKey,
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
import Loader from "@/components/loader";

interface Passkey {
  id: string;
  name?: string;
  createdAt: Date | string;
  deviceType?: string;
}

export function PasskeysSettings() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const fetchPasskeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();

      if (error) {
        toast.error(error.message || "Failed to fetch passkeys");
      } else if (data) {
        setPasskeys(data as Passkey[]);
      }
    } catch (err) {
      toast.error("Failed to load passkeys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setIsAdding(true);
    try {
      const { error } = await authClient.passkey.addPasskey();

      if (error) {
        toast.error(error.message || "Failed to add passkey");
      } else {
        toast.success("Passkey added successfully!");
        fetchPasskeys();
      }
    } catch (err) {
      toast.error("Failed to add passkey");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await authClient.passkey.deletePasskey({
        id,
      });

      if (error) {
        toast.error(error.message || "Failed to delete passkey");
      } else {
        toast.success("Passkey deleted successfully");
        fetchPasskeys();
      }
    } catch (err) {
      toast.error("Failed to delete passkey");
    } finally {
      setDeletingId(null);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType?.toLowerCase().includes("mobile")) {
      return <IconDeviceMobile className="size-5" />;
    }
    return <IconDeviceDesktop className="size-5" />;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Passkeys
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your passkeys for passwordless authentication
        </p>
      </div>

      {/* What are Passkeys */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card/50 to-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconFingerprint className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">What are Passkeys?</CardTitle>
              <CardDescription className="text-sm">
                A secure and convenient way to sign in without passwords
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Passkeys are a secure and convenient way to sign in without a
            password. They use biometrics (like fingerprint or face recognition)
            or your device's screen lock to verify your identity.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <IconKey className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  More Secure
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Can't be phished or stolen
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <IconFingerprint className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Easier to Use
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Just use biometrics
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <IconDeviceDesktop className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Device-Specific
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tied to your device
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Passkey */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconPlus className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Add a Passkey</CardTitle>
              <CardDescription className="text-sm">
                Register a new passkey for this device
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            When you add a passkey, you'll be prompted to authenticate using
            your device's biometric sensor or screen lock. The passkey will be
            securely stored on this device.
          </p>
        </CardContent>
        <CardFooter className="border-t border-border/30 pt-6">
          <Button
            onClick={handleAddPasskey}
            disabled={isAdding}
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {isAdding ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Adding Passkey...
              </>
            ) : (
              <>
                <IconPlus className="mr-2 size-4" />
                Add Passkey
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Registered Passkeys */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconFingerprint className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Passkeys</CardTitle>
              <CardDescription className="text-sm">
                Passkeys registered to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6">
          {passkeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconFingerprint className="size-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium text-muted-foreground">
                No passkeys registered yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a passkey to enable passwordless sign-in
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 p-4 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      {getDeviceIcon(passkey.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {passkey.name || "Passkey"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added{" "}
                        {new Date(passkey.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <IconAlertTriangle className="size-5 text-destructive" />
                          Delete Passkey?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This passkey will be removed from your account. You
                          won't be able to use it to sign in anymore.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePasskey(passkey.id)}
                          disabled={deletingId === passkey.id}
                        >
                          {deletingId === passkey.id
                            ? "Deleting..."
                            : "Delete Passkey"}
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

      {/* Browser Support Note */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconDeviceDesktop className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Browser Support</CardTitle>
              <CardDescription className="text-sm">
                Compatibility information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/30" />
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Passkeys are supported in most modern browsers including Chrome,
            Safari, Firefox, and Edge. If you're having trouble adding a
            passkey, make sure your browser is up to date and that your device
            supports biometric authentication.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/30"
            >
              Chrome 109+
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/30"
            >
              Safari 16+
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/30"
            >
              Firefox 122+
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/30"
            >
              Edge 109+
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
