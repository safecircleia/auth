"use client";

import { useState } from "react";
import { IconCamera, IconCheck, IconLoader2 } from "@tabler/icons-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileSettingsProps {
  user: typeof authClient.$Infer.Session.user;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account preferences
        </p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Your profile picture is visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="size-24">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback className="text-2xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Field>
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <Input
                id="image"
                placeholder="https://example.com/avatar.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <FieldDescription>
                Enter a URL for your profile picture
              </FieldDescription>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldDescription>
                This is the name that will be displayed on your profile
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="flex-1"
                />
                {user.emailVerified ? (
                  <Badge variant="default" className="gap-1">
                    <IconCheck className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">Unverified</Badge>
                )}
              </div>
              <FieldDescription>
                Your email address is used for authentication and notifications
              </FieldDescription>
            </Field>

            {!user.emailVerified && (
              <Button
                variant="outline"
                onClick={handleSendVerificationEmail}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleUpdateProfile} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Information about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                User ID
              </dt>
              <dd className="text-sm font-mono">{user.id}</dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Account Created
              </dt>
              <dd className="text-sm">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Last Updated
              </dt>
              <dd className="text-sm">
                {new Date(user.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
