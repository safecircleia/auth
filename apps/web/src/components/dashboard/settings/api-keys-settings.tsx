"use client";

import { useState, useEffect } from "react";
import {
  IconKey,
  IconPlus,
  IconTrash,
  IconCopy,
  IconLoader2,
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
  IconCalendar,
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
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/loader";

interface ApiKey {
  id: string;
  name?: string;
  key?: string;
  prefix?: string;
  createdAt: Date | string;
  expiresAt?: Date | string | null;
  lastUsedAt?: Date | string | null;
}

export function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.apiKey.list();

      if (error) {
        toast.error(error.message || "Failed to fetch API keys");
      } else if (data) {
        setApiKeys(data as ApiKey[]);
      }
    } catch (err) {
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setIsCreating(true);
    try {
      // expiresIn is in seconds
      const expiresInSeconds =
        expiresIn === "never"
          ? null
          : expiresIn === "30d"
            ? 30 * 24 * 60 * 60
            : expiresIn === "90d"
              ? 90 * 24 * 60 * 60
              : expiresIn === "1y"
                ? 365 * 24 * 60 * 60
                : null;

      const { data, error } = await authClient.apiKey.create({
        name: newKeyName,
        expiresIn: expiresInSeconds,
      });

      if (error) {
        toast.error(error.message || "Failed to create API key");
      } else if (data) {
        setNewKeySecret(data.key || null);
        toast.success("API key created successfully");
        setNewKeyName("");
        setExpiresIn("never");
        setShowCreateForm(false);
        fetchApiKeys();
      }
    } catch (err) {
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await authClient.apiKey.delete({
        keyId: id,
      });

      if (error) {
        toast.error(error.message || "Failed to delete API key");
      } else {
        toast.success("API key deleted successfully");
        fetchApiKeys();
      }
    } catch (err) {
      toast.error("Failed to delete API key");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt?: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Create and manage API keys for programmatic access
        </p>
      </div>

      {/* New Key Secret Modal */}
      {newKeySecret && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconKey className="size-5" />
              API Key Created
            </CardTitle>
            <CardDescription>
              Copy this key now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted p-3 text-sm font-mono break-all">
                {newKeySecret}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newKeySecret, "API key")}
              >
                <IconCopy className="size-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setNewKeySecret(null)}>
              I've saved the key
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Create New Key */}
      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create API Key</CardTitle>
            <CardDescription>
              Generate a new API key for programmatic access to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="keyName">Key Name</FieldLabel>
                <Input
                  id="keyName"
                  placeholder="My API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <FieldDescription>
                  A friendly name to identify this key
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="expiresIn">Expiration</FieldLabel>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger id="expiresIn">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  When should this key expire?
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName("");
                setExpiresIn("never");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={isCreating}>
              {isCreating ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create API Key"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <IconPlus className="size-4" />
          Create API Key
        </Button>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys allow programmatic access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconKey className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No API keys created yet</p>
              <p className="text-sm text-muted-foreground">
                Create an API key to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <IconKey className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {apiKey.name || "Unnamed Key"}
                        </p>
                        {apiKey.expiresAt && isExpired(apiKey.expiresAt) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {apiKey.prefix && (
                          <span className="font-mono">{apiKey.prefix}...</span>
                        )}
                        <span className="flex items-center gap-1">
                          <IconCalendar className="size-3" />
                          Created {formatDate(apiKey.createdAt)}
                        </span>
                        {apiKey.expiresAt && (
                          <span
                            className={
                              isExpired(apiKey.expiresAt)
                                ? "text-destructive"
                                : ""
                            }
                          >
                            Expires {formatDate(apiKey.expiresAt)}
                          </span>
                        )}
                        {apiKey.lastUsedAt && (
                          <span>Last used {formatDate(apiKey.lastUsedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === apiKey.id}
                      >
                        {deletingId === apiKey.id ? (
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
                          Delete API Key?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Any applications using
                          this key will no longer be able to authenticate.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteKey(apiKey.id)}
                        >
                          Delete Key
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

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Using API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Include your API key in the <code>Authorization</code> header when
            making API requests:
          </p>
          <div className="rounded-lg bg-muted p-4">
            <code className="text-sm">
              Authorization: Bearer your_api_key_here
            </code>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Security Best Practices</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                Never share your API keys or commit them to version control
              </li>
              <li>
                Use environment variables to store API keys in your applications
              </li>
              <li>Rotate your keys regularly and delete unused keys</li>
              <li>Set appropriate expiration dates for your keys</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
