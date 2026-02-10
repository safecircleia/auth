"use client";

import { useState } from "react";
import {
  IconCamera,
  IconCheck,
  IconLoader2,
  IconClock,
  IconId,
  IconMail,
  IconPhone,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface ProfileSettingsProps {
  user: typeof authClient.$Infer.Session.user;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [showProfileEmail, setShowProfileEmail] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const { error } = await authClient.updateUser({
        name,
        image: image || undefined,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSendingVerification(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: user.email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification email");
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (err) {
      toast.error("Failed to send verification email");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleSendEmailVerificationOtp = async () => {
    if (!user?.email) return;

    setIsSendingEmailOtp(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: user.email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
      } else {
        toast.success("Verification code sent to your email");
        setEmailToVerify(user.email);
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
      }
    } catch (err) {
      toast.error("Failed to verify email");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

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
      }
    } catch (err) {
      toast.error("Failed to verify phone number");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const accountCreatedDate = new Date(user.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const lastUpdatedDate = new Date(user.updatedAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Blur email address by default
  const blurredEmail = user.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Profile Settings
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your personal information and account preferences
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Sidebar - Profile Card (Unified) */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card/50 to-card/50 backdrop-blur-sm overflow-hidden sticky top-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Profile</CardTitle>
              <CardDescription className="text-sm">
                Account overview and status
              </CardDescription>
            </CardHeader>
            <Separator className="bg-border/30" />

            <CardContent className="pt-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-2 ring-primary/20 shadow-lg shadow-primary/10">
                    <AvatarImage src={image || undefined} alt={name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      {(user.name || user.email)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-card">
                    <IconCamera className="size-5" />
                  </div>
                </div>

                {/* User Name Display */}
                <div className="text-center w-full">
                  <h3 className="text-lg font-semibold text-foreground">
                    {name || "Your Name"}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground truncate mt-1 cursor-default transition-opacity"
                    onMouseEnter={() => setShowProfileEmail(true)}
                    onMouseLeave={() => setShowProfileEmail(false)}
                    title={user.email}
                  >
                    {showProfileEmail ? user.email : blurredEmail}
                  </p>
                </div>

                <Separator className="bg-border/30 w-full" />

                {/* Email Status */}
                <div className="w-full space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email Status
                  </p>
                  {user.emailVerified ? (
                    <Badge className="w-full justify-center gap-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">
                      <IconCheck className="size-3.5" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="w-full justify-center gap-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      <IconCamera className="size-3.5" />
                      Unverified
                    </Badge>
                  )}

                  {!user.emailVerified && (
                    <Button
                      variant="outline"
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingVerification}
                      className="w-full rounded-lg border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-colors text-xs"
                      size="sm"
                    >
                      {isSendingVerification ? (
                        <>
                          <IconLoader2 className="mr-2 size-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <IconMail className="mr-2 size-3" />
                          Verify Email
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Separator className="bg-border/30 w-full" />

                {/* Account Information */}
                <div className="w-full space-y-4">
                  {/* User ID */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <IconId className="size-3.5 text-primary" />
                      User ID
                    </p>
                    <div
                      className="relative cursor-pointer group"
                      onMouseEnter={() => setShowUserId(true)}
                      onMouseLeave={() => setShowUserId(false)}
                    >
                      <p className="text-xs font-mono text-foreground bg-primary/5 p-2 rounded-lg border border-primary/10 break-all transition-all duration-200">
                        {showUserId ? user.id : `${user.id.slice(0, 16)}...`}
                      </p>
                    </div>
                  </div>

                  {/* Account Created */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <IconClock className="size-3.5 text-primary" />
                      Created
                    </p>
                    <p className="text-sm text-foreground">
                      {accountCreatedDate}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <IconClock className="size-3.5 text-primary" />
                      Last Updated
                    </p>
                    <p className="text-sm text-foreground">{lastUpdatedDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconMail className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Update your profile details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-border/30" />
            <CardContent className="pt-6 space-y-6">
              {/* Full Name Field */}
              <Field className="space-y-3">
                <FieldLabel htmlFor="name" className="text-sm font-semibold">
                  Full Name
                </FieldLabel>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50 text-base"
                />
                <FieldDescription className="text-xs">
                  This name will be displayed on your profile and in
                  communications
                </FieldDescription>
              </Field>

              {/* Email Field with Blur */}
              <div className="space-y-3">
                <FieldLabel htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </FieldLabel>
                <div
                  className="relative cursor-pointer group"
                  onMouseEnter={() => setShowProfileEmail(true)}
                  onMouseLeave={() => setShowProfileEmail(false)}
                >
                  <Input
                    id="email"
                    value={showProfileEmail ? user.email : blurredEmail}
                    disabled
                    className="rounded-lg bg-input/30 border-border/30 text-muted-foreground transition-all duration-200"
                  />
                </div>
                <FieldDescription className="text-xs">
                  Your email is used for authentication and account recovery.
                  {!showProfileEmail && " Hover to reveal"}
                </FieldDescription>
              </div>
            </CardContent>
            <Separator className="bg-border/30" />
            <div className="px-6 py-4 bg-card/30 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="space-y-1 text-left">
                <Button
                  variant="outline"
                  onClick={() => setShowChangeEmailDialog(true)}
                  className="rounded-lg border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-colors w-full sm:w-auto"
                  size="sm"
                >
                  Change Email
                </Button>
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {isUpdating ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
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
                  Enter your new email address. You'll receive a verification
                  code to confirm the change.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Field>
                  <FieldLabel
                    htmlFor="newEmail"
                    className="text-sm font-semibold"
                  >
                    New Email Address
                  </FieldLabel>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50 mt-2"
                  />
                </Field>
              </div>
              {showEmailOtpInput && (
                <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-foreground">
                    Enter the verification code sent to{" "}
                    <strong className="text-primary">{emailToVerify}</strong>
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
                      className="flex-1 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={isVerifyingEmail || emailOtp.length !== 6}
                      className="flex-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isVerifyingEmail ? (
                        <>
                          <IconLoader2 className="mr-2 size-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <IconCheck className="mr-2 size-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNewEmail("")}>
                  {showEmailOtpInput ? "Skip" : "Cancel"}
                </AlertDialogCancel>
                {!showEmailOtpInput && (
                  <AlertDialogAction
                    onClick={handleChangeEmail}
                    disabled={isSendingEmailOtp || !newEmail}
                  >
                    {isSendingEmailOtp
                      ? "Sending..."
                      : "Send Verification Code"}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Phone Information Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconPhone className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Phone Number</CardTitle>
                  <CardDescription className="text-sm">
                    Add a phone number for additional security and account
                    recovery
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-border/30" />
            <CardContent className="pt-6 space-y-4">
              {(user as any)?.phoneNumber ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <IconPhone className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {(user as any).phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verified phone number
                      </p>
                    </div>
                  </div>
                  <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 flex-shrink-0 ml-4">
                    <IconCheck className="size-3" />
                    Verified
                  </Badge>
                </div>
              ) : (
                <>
                  {!showPhoneOtpInput ? (
                    <div className="space-y-3">
                      <FieldLabel
                        htmlFor="phoneNumber"
                        className="text-sm font-semibold"
                      >
                        Phone Number
                      </FieldLabel>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="rounded-lg bg-input/50 border-border/50 focus:border-primary/50"
                      />
                      <FieldDescription className="text-xs">
                        Enter your phone number including country code
                      </FieldDescription>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm text-foreground">
                        Enter the verification code sent to{" "}
                        <strong className="text-primary">{phoneNumber}</strong>
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
                          className="flex-1 rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleVerifyPhone}
                          disabled={isVerifyingPhone || phoneOtp.length !== 6}
                          className="flex-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isVerifyingPhone ? (
                            <>
                              <IconLoader2 className="mr-2 size-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <IconCheck className="mr-2 size-4" />
                              Verify
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            {!(user as any)?.phoneNumber && !showPhoneOtpInput && (
              <>
                <Separator className="bg-border/30" />
                <div className="px-6 py-4 bg-card/30 flex flex-col sm:flex-row gap-3 justify-end items-center">
                  <Button
                    onClick={handleSendPhoneOtp}
                    disabled={isSendingPhoneOtp || !phoneNumber}
                    className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    {isSendingPhoneOtp ? (
                      <>
                        <IconLoader2 className="mr-2 size-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <IconPhone className="mr-2 size-4" />
                        Add Phone Number
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
