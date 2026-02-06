"use client";

import { useState } from "react";
import {
  IconCheck,
  IconLoader2,
  IconMail,
  IconPhone,
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
import { InputOTP } from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ContactSettings() {
  const { data: session, refetch: refetchSession } = authClient.useSession();

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);

  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);

  // Email verification
  const handleSendEmailVerificationOtp = async () => {
    if (!session?.user.email) return;

    setIsSendingEmailOtp(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: session.user.email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
      } else {
        toast.success("Verification code sent to your email");
        setEmailToVerify(session.user.email);
        setShowEmailOtpInput(true);
      }
    } catch (err) {
      toast.error("Failed to send verification code");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (emailOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: emailToVerify,
        otp: emailOtp,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
      } else {
        toast.success("Email verified successfully!");
        setShowEmailOtpInput(false);
        setEmailOtp("");
        refetchSession();
      }
    } catch (err) {
      toast.error("Failed to verify email");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Change email
  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    setIsSendingEmailOtp(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail,
      });

      if (error) {
        toast.error(error.message || "Failed to initiate email change");
      } else {
        toast.success("Verification code sent to your new email");
        setEmailToVerify(newEmail);
        setShowChangeEmailDialog(false);
        setShowEmailOtpInput(true);
      }
    } catch (err) {
      toast.error("Failed to change email");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  // Phone number
  const handleSendPhoneOtp = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSendingPhoneOtp(true);
    try {
      const { error } = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
      } else {
        toast.success("Verification code sent to your phone");
        setShowPhoneOtpInput(true);
      }
    } catch (err) {
      toast.error("Failed to send verification code");
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const { error } = await authClient.phoneNumber.verify({
        phoneNumber,
        code: phoneOtp,
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
      } else {
        toast.success("Phone number verified successfully!");
        setShowPhoneOtpInput(false);
        setPhoneOtp("");
        setPhoneNumber("");
        refetchSession();
      }
    } catch (err) {
      toast.error("Failed to verify phone number");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email & Phone</h1>
        <p className="text-muted-foreground">
          Manage your email address and phone number
        </p>
      </div>

      {/* Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMail className="size-5" />
            Email Address
          </CardTitle>
          <CardDescription>
            Your email address is used for authentication and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <IconMail className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{session?.user.email}</p>
                <p className="text-sm text-muted-foreground">Primary email</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.user.emailVerified ? (
                <Badge variant="default" className="gap-1">
                  <IconCheck className="size-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">Unverified</Badge>
              )}
            </div>
          </div>

          {!session?.user.emailVerified && !showEmailOtpInput && (
            <Button
              variant="outline"
              onClick={handleSendEmailVerificationOtp}
              disabled={isSendingEmailOtp}
            >
              {isSendingEmailOtp ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Verify Email Address"
              )}
            </Button>
          )}

          {showEmailOtpInput && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <p className="text-sm">
                Enter the verification code sent to{" "}
                <strong>{emailToVerify}</strong>
              </p>
              <div className="flex justify-center">
                <InputOTP
                  length={6}
                  value={emailOtp}
                  onChange={(value) => setEmailOtp(value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailOtpInput(false);
                    setEmailOtp("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyEmail}
                  disabled={isVerifyingEmail || emailOtp.length !== 6}
                >
                  {isVerifyingEmail ? (
                    <>
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button
            variant="outline"
            onClick={() => setShowChangeEmailDialog(true)}
          >
            Change Email Address
          </Button>
        </CardFooter>
      </Card>

      {/* Change Email Dialog */}
      <AlertDialog
        open={showChangeEmailDialog}
        onOpenChange={setShowChangeEmailDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Email Address</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new email address. You'll receive a verification code
              to confirm the change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Field>
              <FieldLabel htmlFor="newEmail">New Email Address</FieldLabel>
              <Input
                id="newEmail"
                type="email"
                placeholder="newemail@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Field>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewEmail("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeEmail}
              disabled={isSendingEmailOtp || !newEmail}
            >
              {isSendingEmailOtp ? "Sending..." : "Send Verification Code"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phone Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPhone className="size-5" />
            Phone Number
          </CardTitle>
          <CardDescription>
            Add a phone number for additional security and account recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(session?.user as any)?.phoneNumber ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <IconPhone className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {(session?.user as any).phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verified phone number
                  </p>
                </div>
              </div>
              <Badge variant="default" className="gap-1">
                <IconCheck className="size-3" />
                Verified
              </Badge>
            </div>
          ) : (
            <>
              {!showPhoneOtpInput ? (
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <FieldDescription>
                      Enter your phone number including country code
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              ) : (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm">
                    Enter the verification code sent to{" "}
                    <strong>{phoneNumber}</strong>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP
                      length={6}
                      value={phoneOtp}
                      onChange={(value) => setPhoneOtp(value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPhoneOtpInput(false);
                        setPhoneOtp("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerifyPhone}
                      disabled={isVerifyingPhone || phoneOtp.length !== 6}
                    >
                      {isVerifyingPhone ? (
                        <>
                          <IconLoader2 className="mr-2 size-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        {!(session?.user as any)?.phoneNumber && !showPhoneOtpInput && (
          <CardFooter className="border-t pt-6">
            <Button
              onClick={handleSendPhoneOtp}
              disabled={isSendingPhoneOtp || !phoneNumber}
            >
              {isSendingPhoneOtp ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Add Phone Number"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Why Add Contact Information?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>
              <strong>Account Recovery:</strong> Recover your account if you
              forget your password
            </li>
            <li>
              <strong>Security Alerts:</strong> Get notified about suspicious
              activity on your account
            </li>
            <li>
              <strong>Two-Factor Authentication:</strong> Use your phone for
              additional login verification
            </li>
            <li>
              <strong>Important Updates:</strong> Receive critical updates about
              your account and services
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
