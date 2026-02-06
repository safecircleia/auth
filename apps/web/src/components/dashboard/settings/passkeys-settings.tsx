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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Passkeys</h1>
        <p className="text-muted-foreground">
          Manage your passkeys for passwordless authentication
        </p>
      </div>

      {/* What are Passkeys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFingerprint className="size-5 text-primary" />
            What are Passkeys?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Passkeys are a secure and convenient way to sign in without a
            password. They use biometrics (like fingerprint or face recognition)
            or your device's screen lock to verify your identity.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <IconKey className="size-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">More Secure</p>
                <p className="text-xs text-muted-foreground">
                  Can't be phished or stolen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <IconFingerprint className="size-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Easier to Use</p>
                <p className="text-xs text-muted-foreground">
                  Just use biometrics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <IconDeviceDesktop className="size-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Device-Specific</p>
                <p className="text-xs text-muted-foreground">
                  Tied to your device
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Passkey */}
      <Card>
        <CardHeader>
          <CardTitle>Add a Passkey</CardTitle>
          <CardDescription>
            Register a new passkey for this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When you add a passkey, you'll be prompted to authenticate using
            your device's biometric sensor or screen lock. The passkey will be
            securely stored on this device.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleAddPasskey} disabled={isAdding}>
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
      <Card>
        <CardHeader>
          <CardTitle>Your Passkeys</CardTitle>
          <CardDescription>
            Passkeys registered to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passkeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconFingerprint className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No passkeys registered yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add a passkey to enable passwordless sign-in
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      {getDeviceIcon(passkey.deviceType)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {passkey.name || "Passkey"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Added{" "}
                        {new Date(passkey.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
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
      <Card>
        <CardHeader>
          <CardTitle>Browser Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Passkeys are supported in most modern browsers including Chrome,
            Safari, Firefox, and Edge. If you're having trouble adding a
            passkey, make sure your browser is up to date and that your device
            supports biometric authentication.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Chrome 109+</Badge>
            <Badge variant="secondary">Safari 16+</Badge>
            <Badge variant="secondary">Firefox 122+</Badge>
            <Badge variant="secondary">Edge 109+</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
