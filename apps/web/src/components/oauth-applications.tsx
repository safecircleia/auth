"use client";

import { useEffect, useState } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  type DialogContentProps,
} from "@/components/animate-ui/components/radix/dialog";
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
import { toast } from "sonner";
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconRefresh,
  IconExternalLink,
  IconKey,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface OAuthClient {
  id: string;
  clientId: string;
  client_id?: string;
  clientSecret?: string;
  client_secret?: string;
  name?: string;
  client_name?: string;
  redirectUris?: string[];
  redirect_uris?: string[];
  scopes?: string[];
  createdAt?: Date;
  created_at?: string;
  public?: boolean;
  disabled?: boolean;
}

export function OAuthApplications() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dialogFrom, setDialogFrom] =
    useState<DialogContentProps["from"]>("top");
  const [newClientSecret, setNewClientSecret] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for new client
  const [newClient, setNewClient] = useState({
    name: "",
    redirectUri: "",
  });

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.oauth2.getClients();
      if (error) {
        toast.error(error.message || "Failed to fetch clients");
      } else if (data) {
        setClients(data as unknown as OAuthClient[]);
      }
    } catch (err) {
      toast.error("Failed to load OAuth applications");
    } finally {
      setIsLoading(false);
    }
  }

  async function createClient() {
    if (!newClient.name || !newClient.redirectUri) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await authClient.oauth2.register({
        client_name: newClient.name,
        redirect_uris: [newClient.redirectUri],
      });

      if (error) {
        toast.error(error.message || "Failed to create client");
      } else if (data) {
        // Store the client secret to show to the user (only shown once)
        if (data.client_secret) {
          setNewClientSecret(data.client_secret);
        }
        toast.success("OAuth application created successfully");
        setNewClient({ name: "", redirectUri: "" });
        setShowCreateDialog(false);
        fetchClients();
      }
    } catch (err) {
      toast.error("Failed to create OAuth application");
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteClient(clientId: string) {
    setDeletingId(clientId);
    try {
      const { error } = await authClient.oauth2.deleteClient({
        client_id: clientId,
      });

      if (error) {
        toast.error(error.message || "Failed to delete client");
      } else {
        toast.success("OAuth application deleted");
        fetchClients();
      }
    } catch (err) {
      toast.error("Failed to delete OAuth application");
    } finally {
      setDeletingId(null);
    }
  }

  async function rotateSecret(clientId: string) {
    try {
      const { data, error } = await authClient.oauth2.client.rotateSecret({
        client_id: clientId,
      });

      if (error) {
        toast.error(error.message || "Failed to rotate secret");
      } else if (data) {
        setNewClientSecret(data.client_secret || null);
        toast.success("Client secret rotated successfully");
      }
    } catch (err) {
      toast.error("Failed to rotate client secret");
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function toggleSecretVisibility(clientId: string) {
    setShowSecrets((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Client Secret Modal */}
      {newClientSecret && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconKey className="size-5" />
              Client Secret Created
            </CardTitle>
            <CardDescription>
              Copy this secret now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted p-3 text-sm font-mono break-all">
                {newClientSecret}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(newClientSecret, "Client secret")
                }
              >
                <IconCopy className="size-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setNewClientSecret(null)}>
              I've saved the secret
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Create New Client Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultOpen={false}
      >
        <DialogTrigger asChild>
          <Button className="gap-2">
            <IconPlus className="size-4" />
            Create OAuth Application
          </Button>
        </DialogTrigger>
        <DialogContent
          from={dialogFrom}
          showCloseButton={true}
          className="sm:max-w-[500px]"
        >
          <DialogHeader>
            <DialogTitle>Create OAuth Application</DialogTitle>
            <DialogDescription>
              Register a new OAuth client to allow external applications to
              authenticate with your server.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Application Name</FieldLabel>
              <Input
                id="name"
                placeholder="My Application"
                value={newClient.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
              <FieldDescription>
                A friendly name for your application
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="redirectUri">Redirect URI</FieldLabel>
              <Input
                id="redirectUri"
                placeholder="https://myapp.com/callback"
                value={newClient.redirectUri}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewClient({ ...newClient, redirectUri: e.target.value })
                }
              />
              <FieldDescription>
                The URL to redirect users after authorization
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setNewClient({ name: "", redirectUri: "" });
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={createClient} disabled={isCreating}>
              {isCreating ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client List */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No OAuth applications yet. Create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {client.name ||
                        client.client_name ||
                        "Unnamed Application"}
                      {client.public && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                      {client.disabled && (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created{" "}
                      {client.createdAt || client.created_at
                        ? new Date(
                            client.createdAt || client.created_at!,
                          ).toLocaleDateString()
                        : "Unknown"}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === client.clientId}
                      >
                        {deletingId === client.clientId ? (
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
                          Delete OAuth Application?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Any applications using
                          this client ID will no longer be able to authenticate.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteClient(
                              client.clientId || client.client_id || "",
                            )
                          }
                        >
                          Delete Application
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Client ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
                      {client.clientId || client.client_id}
                    </code>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        copyToClipboard(
                          client.clientId || client.client_id || "",
                          "Client ID",
                        )
                      }
                    >
                      <IconCopy className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Redirect URIs */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Redirect URIs
                  </label>
                  <div className="mt-1 space-y-1">
                    {(client.redirectUris || client.redirect_uris || []).map(
                      (uri, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono truncate">
                            {uri}
                          </code>
                          <Button variant="outline" size="icon-sm" asChild>
                            <a
                              href={uri}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconExternalLink className="size-4" />
                            </a>
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Scopes */}
                {client.scopes && client.scopes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Allowed Scopes
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.scopes.map((scope) => (
                        <Badge key={scope} variant="secondary">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              {!client.public && (
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      rotateSecret(client.clientId || client.client_id || "")
                    }
                  >
                    <IconRefresh className="size-4" />
                    Rotate Secret
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
