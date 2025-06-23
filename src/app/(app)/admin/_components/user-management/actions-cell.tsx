"use client";

import { LoadingButton } from "@/components/loading-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { admin, useSession } from "@/lib/auth-client";
import { BanUserSchema, banUserSchema } from "@/lib/zod/user.schema";
import {
  BanIcon,
  HelpCircle,
  MoreHorizontalIcon,
  UnlockIcon,
  UserCog2Icon,
  XIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSendNotification } from "@/hooks/use-notification";
import { UserWithRole } from "better-auth/plugins";
import { roleMap } from "@/components/role-display";

export function ActionsCell({ user }: { user: UserWithRole }) {
  // states
  const [showRoles, setShowRoles] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [showUnban, setShowUnban] = useState(false);
  const [pending, setPending] = useState(false);
  const [roles, setRoles] = useState<string[]>(
    user.role?.split(",").map((r: string) => r.trim()) ?? []
  );

  // hooks
  const { mutate: sendNotification } = useSendNotification();
  const { data: session, refetch } = useSession();
  const form = useForm<BanUserSchema>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      banReason: "",
      permanent: false,
      banExpires: 1,
    },
  });

  const isSelf = session?.user.id === user.id;

  const onHandleBanSubmit = async (data: BanUserSchema) => {
    setPending(true);
    try {
      await admin.banUser(
        {
          userId: user.id,
          banExpiresIn: data.permanent
            ? undefined
            : 60 * 60 * 24 * (data.banExpires ?? 0),
          banReason: data.banReason,
        },
        {
          onSuccess: () => {
            toast.success("User banned successfully", {
              description: "The user has been banned from the platform.",
            });
            // send notification to user
            sendNotification({
              message: `You have been banned from the platform: ${data.banReason}`,
              user: {
                connect: {
                  id: user.id,
                },
              },
            });
            admin.revokeUserSessions({ userId: user.id });
            form.reset();
          },
          onError: (ctx) => {
            toast.error("Something went wrong", {
              description: ctx.error.message,
            });
          },
        }
      );
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  const onHandleUnBanUser = async () => {
    try {
      await admin.unbanUser({ userId: user.id });
      toast.success("User unbanned successfully", {
        description: "The user has been unbanned from the platform.",
      });
      sendNotification({
        message: `You have been unbanned from the platform`,
        user: {
          connect: {
            id: user.id,
          },
        },
      });
      refetch();
    } catch (error) {
      toast.error("Something went wrong", {
        description: JSON.stringify(error, null, 2),
      });
    } finally {
      setShowUnban(false);
    }
  };

  const availableRoles = ["admin", "user", "u1", "u2", "u3", "u4", "u5"];

  const handleAddRole = (role: string) => {
    if (!roles.includes(role)) {
      setRoles([...roles, role]);
    }
  };

  const handleRemoveRole = (role: string) => {
    setRoles(roles.filter((r) => r !== role));
  };

  const handleSave = async () => {
    const roleInfo = roles.map(
      (role) => roleMap[role as keyof typeof roleMap].label
    );

    await admin.setRole({
      userId: user.id,
      role: roles as ("admin" | "user" | "u1" | "u2" | "u3" | "u4" | "u5")[],
    });

    toast.success("Roles updated", {
      description: `Roles updated: ${roleInfo.join(", ")} to ${user.name}`,
    });

    sendNotification({
      message: `Your roles have been updated to ${roleInfo.join(
        ", "
      )}, you can now access the platform with these roles`,
      user: {
        connect: {
          id: user.id,
        },
      },
    });
    refetch();
    setShowRoles(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowRoles(true)}>
            <UserCog2Icon className="w-4 h-4" />
            Manage Roles
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowUnban(true)}
            disabled={!user.banned}
          >
            <UnlockIcon className="w-4 h-4" />
            Unban User
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowBan(true)}
            disabled={isSelf}
          >
            <BanIcon className="w-4 h-4" />
            Ban User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showRoles && (
        <Dialog open={showRoles} onOpenChange={setShowRoles}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User Roles</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Current Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const roleInfo = roleMap[role as keyof typeof roleMap] ?? {
                      label: role,
                      icon: (
                        <HelpCircle className="w-4 h-4 text-muted-foreground mr-2" />
                      ),
                      description: "Unknown role",
                    };

                    return (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRole(role)}
                      >
                        {roleInfo.icon}
                        <span>{roleInfo.label}</span>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Available Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => {
                    const roleInfo = roleMap[role as keyof typeof roleMap] ?? {
                      label: role,
                      icon: (
                        <HelpCircle className="w-4 h-4 text-muted-foreground mr-2" />
                      ),
                      description: "Unknown role",
                    };

                    return (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddRole(role)}
                        disabled={roles.includes(role)}
                      >
                        {roleInfo.icon}
                        <span>{roleInfo.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRoles(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showUnban && (
        <AlertDialog open={showUnban} onOpenChange={setShowUnban}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unban User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unban this user? This will allow them
                to access the platform again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onHandleUnBanUser}>
                Unban
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showBan && (
        <Dialog open={showBan} onOpenChange={setShowBan}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User: {user.name}</DialogTitle>
              <DialogDescription>
                Ban a user from the platform. This will prevent them from
                accessing the platform.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onHandleBanSubmit)}
              >
                <FormField
                  control={form.control}
                  name="banReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ban Reason</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="banExpires"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ban Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of days"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value > 0) field.onChange(value);
                          }}
                          value={field.value}
                          disabled={form.watch("permanent")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="permanent"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                        />
                      </FormControl>
                      <FormLabel>Permanent Ban</FormLabel>
                    </FormItem>
                  )}
                />
                <LoadingButton pending={pending}>Sign Up</LoadingButton>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
