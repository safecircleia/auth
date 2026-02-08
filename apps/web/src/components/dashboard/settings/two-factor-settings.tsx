"use client";

import { useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconLoader2,
  IconShield,
  IconShieldOff,
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
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP } from "@/components/ui/input-otp";

export function TwoFactorSettings() {
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const isTwoFactorEnabled = (session?.user as any)?.twoFactorEnabled ?? false;

  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isGeneratingBackupCodes, setIsGeneratingBackupCodes] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showBackupPasswordDialog, setShowBackupPasswordDialog] =
    useState(false);
  const [enablePassword, setEnablePassword] = useState("");
  const [backupPassword, setBackupPassword] = useState("");

  const [showSetup, setShowSetup] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const [disablePassword, setDisablePassword] = useState("");

  const handleEnableTwoFactor = async () => {
    if (!enablePassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsEnabling(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: enablePassword,
      });

      if (error) {
        toast.error(
          error.message || "Failed to enable two-factor authentication",
        );
        return;
      }

      if (data) {
        setTotpUri(data.totpURI);
        // Extract secret from TOTP URI
        const secretMatch = data.totpURI.match(/secret=([A-Z2-7]+)/i);
        setSecret(secretMatch ? secretMatch[1] : "");
        setBackupCodes(data.backupCodes);
        setShowSetup(true);
        setShowPasswordDialog(false);
        setEnablePassword("");
      }
    } catch (err) {
      toast.error("Failed to enable two-factor authentication");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
      } else {
        toast.success("Two-factor authentication enabled successfully!");
        setShowSetup(false);
        setShowBackupCodes(true);
        setVerificationCode("");
        refetchSession();
      }
    } catch (err) {
      toast.error("Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disablePassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsDisabling(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password: disablePassword,
      });

      if (error) {
        toast.error(
          error.message || "Failed to disable two-factor authentication",
        );
      } else {
        toast.success("Two-factor authentication disabled");
        setDisablePassword("");
        refetchSession();
      }
    } catch (err) {
      toast.error("Failed to disable two-factor authentication");
    } finally {
      setIsDisabling(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!backupPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsGeneratingBackupCodes(true);
    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password: backupPassword,
      });

      if (error) {
        toast.error(error.message || "Failed to generate backup codes");
      } else if (data) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setShowBackupPasswordDialog(false);
        setBackupPassword("");
        toast.success("New backup codes generated");
      }
    } catch (err) {
      toast.error("Failed to generate backup codes");
    } finally {
      setIsGeneratingBackupCodes(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isTwoFactorEnabled ? (
              <IconShield className="size-5 text-green-500" />
            ) : (
              <IconShieldOff className="size-5 text-muted-foreground" />
            )}
            Two-Factor Authentication Status
          </CardTitle>
          <CardDescription>
            {isTwoFactorEnabled
              ? "Your account is protected with two-factor authentication"
              : "Enable two-factor authentication for enhanced security"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge
              variant={isTwoFactorEnabled ? "default" : "secondary"}
              className="text-sm"
            >
              {isTwoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
            {isTwoFactorEnabled && (
              <span className="text-sm text-muted-foreground">
                Using authenticator app
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          {!isTwoFactorEnabled ? (
            <Button onClick={() => setShowPasswordDialog(true)}>
              <IconShield className="mr-2 size-4" />
              Enable Two-Factor Auth
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <IconShieldOff className="mr-2 size-4" />
                  Disable Two-Factor Auth
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <IconAlertTriangle className="size-5 text-destructive" />
                    Disable Two-Factor Authentication?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make your account less secure. You'll need to
                    enter your password to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Field>
                    <FieldLabel htmlFor="disablePassword">Password</FieldLabel>
                    <Input
                      id="disablePassword"
                      type="password"
                      placeholder="Enter your password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                    />
                  </Field>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDisablePassword("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisableTwoFactor}
                    disabled={isDisabling || !disablePassword}
                  >
                    {isDisabling ? "Disabling..." : "Disable 2FA"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>

      {/* Password Dialog for Enabling 2FA */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconShield className="size-5 text-primary" />
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Enter your password to set up two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Field>
              <FieldLabel htmlFor="enablePassword">Password</FieldLabel>
              <Input
                id="enablePassword"
                type="password"
                placeholder="Enter your password"
                value={enablePassword}
                onChange={(e) => setEnablePassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && enablePassword) {
                    handleEnableTwoFactor();
                  }
                }}
              />
              <FieldDescription>
                Your password is required to enable 2FA
              </FieldDescription>
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setEnablePassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableTwoFactor}
              disabled={isEnabling || !enablePassword}
            >
              {isEnabling ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setup Card */}
      {showSetup && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Authenticator App</CardTitle>
            <CardDescription>
              Scan the QR code or enter the secret key in your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border bg-white p-4">
                {totpUri && (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                    alt="2FA QR Code"
                    className="size-48"
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your authenticator app
                <br />
                (Google Authenticator, Authy, 1Password, etc.)
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Can't scan the QR code? Enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-3 text-sm font-mono break-all">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret, "Secret key")}
                >
                  <IconCopy className="size-4" />
                </Button>
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-4">
              <Field>
                <FieldLabel>Enter Verification Code</FieldLabel>
                <div className="flex justify-center">
                  <InputOTP
                    length={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                  />
                </div>
                <FieldDescription className="text-center">
                  Enter the 6-digit code from your authenticator app
                </FieldDescription>
              </Field>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowSetup(false);
                setVerificationCode("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyAndEnable}
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 size-4" />
                  Verify and Enable
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Backup Codes Card */}
      {showBackupCodes && backupCodes.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconKey className="size-5 text-yellow-500" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Save these backup codes in a secure place. You can use them to
              access your account if you lose access to your authenticator app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="rounded bg-muted px-3 py-2 text-center font-mono text-sm"
                >
                  {code}
                </code>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 border-t pt-6">
            <Button variant="outline" onClick={copyBackupCodes}>
              <IconCopy className="mr-2 size-4" />
              Copy All Codes
            </Button>
            <Button variant="ghost" onClick={() => setShowBackupCodes(false)}>
              I've saved the codes
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Regenerate Backup Codes */}
      {isTwoFactorEnabled && !showBackupCodes && (
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>
              Generate new backup codes if you've lost or used your previous
              ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Backup codes can be used to access your account if you lose access
              to your authenticator app. Each code can only be used once.
            </p>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setShowBackupPasswordDialog(true)}
            >
              <IconKey className="mr-2 size-4" />
              Generate New Backup Codes
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Password Dialog for Generating Backup Codes */}
      <Dialog
        open={showBackupPasswordDialog}
        onOpenChange={setShowBackupPasswordDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconKey className="size-5 text-primary" />
              Generate New Backup Codes
            </DialogTitle>
            <DialogDescription>
              Enter your password to generate new backup codes. This will
              invalidate your existing backup codes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Field>
              <FieldLabel htmlFor="backupPassword">Password</FieldLabel>
              <Input
                id="backupPassword"
                type="password"
                placeholder="Enter your password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && backupPassword) {
                    handleGenerateBackupCodes();
                  }
                }}
              />
              <FieldDescription>
                Your password is required to generate new backup codes
              </FieldDescription>
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBackupPasswordDialog(false);
                setBackupPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateBackupCodes}
              disabled={isGeneratingBackupCodes || !backupPassword}
            >
              {isGeneratingBackupCodes ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Codes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Two-Factor Authentication Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              When you sign in, you'll enter your email and password as usual
            </li>
            <li>
              Then, you'll be asked to enter a 6-digit code from your
              authenticator app
            </li>
            <li>
              The code changes every 30 seconds, making it nearly impossible for
              attackers to access your account
            </li>
            <li>
              If you lose access to your authenticator, you can use a backup
              code to sign in
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
