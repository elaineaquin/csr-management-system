"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentFolder } from "@/types/document.type";
import { useGetUsersList } from "@/hooks/use-auth";
import { Link, TrashIcon, UserPlus, X } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DocumentPermission,
  documentPermissions,
} from "@/lib/zod/document.schema";
import { SelectedUser, User } from "@/server/document";
import {
  useDeleteDocumentFolder,
  useGenerateInviteLink,
  useRemoveInviteLink,
  useShareDocuments,
  useUpdateDocumentRestriction,
} from "@/hooks/use-document";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { ButtonGuard } from "@/components/button-guard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export function TableActions({ folder }: { folder: DocumentFolder }) {
  const { data: session } = useSession();
  const { mutateAsync: generateInviteLink } = useGenerateInviteLink();
  const { mutateAsync: removeInviteLink } = useRemoveInviteLink();
  const { mutateAsync: shareDocumentAsync } = useShareDocuments();
  const { mutateAsync: updateRestriction } = useUpdateDocumentRestriction();
  const { mutateAsync: deleteFolder } = useDeleteDocumentFolder();

  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isRestricted, setIsRestricted] = useState(folder.isRestricted);
  const [inviteToken, setInviteToken] = useState(
    folder.inviteToken ?? undefined
  );

  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>(
    folder.shared ?? []
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const {
    data: result,
    isLoading,
    isError,
  } = useGetUsersList({ limit: 10, offset: 0, searchValue });
  const isOwner = session?.user.id === folder.ownerId;
  const members = folder.shared;
  const users = (result?.users ?? [])
    .filter((user) => user.id !== folder.ownerId)
    .filter((user) => !members.some((member) => member.id === user.id));

  const handleUserSelect = (user: User) => {
    const alreadySelected = selectedUsers.some((u) => u.id === user.id);
    if (!alreadySelected) {
      setSelectedUsers([
        ...selectedUsers,
        { ...user, permission: documentPermissions[0] },
      ]);
    }
    setSearchValue("");
  };

  const handleUserRemove = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handlePermissionChange = (
    id: string,
    permission: DocumentPermission
  ) => {
    setSelectedUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, permission } : user))
    );
  };

  const onHandleShareDocument = async () => {
    const usersToShare = selectedUsers.filter((selectedUser) => {
      const existingUser = folder.shared.find((u) => u.id === selectedUser.id);
      return (
        !existingUser || existingUser.permission !== selectedUser.permission
      );
    });

    if (usersToShare.length > 0) {
      await shareDocumentAsync({ folderId: folder.id, users: usersToShare });
    }

    setOpenShareDialog(false);
    setSelectedUsers([]);
  };

  return (
    <div className="flex justify-end space-x-2">
      <TooltipProvider>
        <ButtonGuard isOwner={isOwner} name="document" actions={["share"]}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpenShareDialog(true)}
              >
                <UserPlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share folder</TooltipContent>
          </Tooltip>
        </ButtonGuard>

        <ButtonGuard isOwner={isOwner} name="document" actions={["delete"]}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpenDeleteDialog(true)}
              >
                <TrashIcon className="text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete folder</TooltipContent>
          </Tooltip>
        </ButtonGuard>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_APP_URL}/document/${folder.id}`
                );
                toast.success("Folder link copied");
              }}
            >
              <Link />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy folder link</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Share with people and groups
            </DialogTitle>
          </DialogHeader>
          {selectedUsers.length > 0 && (
            <ScrollArea className="max-h-40 space-y-2 mt-4 pr-3">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md border p-2 mb-2"
                >
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <Select
                      value={user.permission}
                      onValueChange={(value) =>
                        handlePermissionChange(
                          user.id,
                          value as DocumentPermission
                        )
                      }
                      disabled={!isRestricted}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Permissions</SelectLabel>
                          {documentPermissions.map((permission) => (
                            <SelectItem key={permission} value={permission}>
                              {permission}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUserRemove(user.id)}
                      disabled={!isRestricted}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant={"outline"} disabled={!isRestricted}>
                Add people
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[350px]">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search users..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  {isLoading && (
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading...
                    </div>
                  )}
                  {isError && (
                    <div className="p-2 text-sm text-red-500">
                      Error fetching users
                    </div>
                  )}
                  <CommandEmpty>No users found.</CommandEmpty>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        handleUserSelect(user);
                        setPopoverOpen(false);
                      }}
                      className={cn(
                        "flex justify-between px-3 py-2 cursor-pointer",
                        selectedUsers.some((u) => u.id === user.id) &&
                          "opacity-50 pointer-events-none"
                      )}
                    >
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="pt-4 flex flex-col gap-4">
            {/* Folder Access Restriction Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="restrict-toggle" className="text-sm font-medium">
                Restrict folder access
              </Label>
              <Switch
                id="restrict-toggle"
                checked={isRestricted}
                onCheckedChange={async (checked) => {
                  await updateRestriction({
                    folderId: folder.id,
                    isRestricted: checked,
                  });
                  setIsRestricted(checked);
                }}
              />
            </div>

            {/* Invite Link Toggle + Permission */}
            {isRestricted && (
              <>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="invite-link-toggle"
                    className="text-sm font-medium"
                  >
                    Enable invite link
                  </Label>
                  <Switch
                    id="invite-link-toggle"
                    checked={Boolean(inviteToken)}
                    onCheckedChange={async (enabled) => {
                      const response = enabled
                        ? await generateInviteLink({ folderId: folder.id })
                        : await removeInviteLink({ folderId: folder.id });

                      setInviteToken(response?.inviteToken ?? undefined);
                    }}
                  />
                </div>

                {inviteToken && (
                  <div className="space-y-1">
                    <Label className="text-sm">Invite link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        className="flex-1"
                        value={`${process.env.NEXT_PUBLIC_APP_URL}/document/invite/${inviteToken}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${process.env.NEXT_PUBLIC_APP_URL}/document/invite/${inviteToken}`
                          );
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Share Button */}
            <div className="flex justify-end">
              <Button
                onClick={onHandleShareDocument}
                disabled={selectedUsers.length === 0}
              >
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this folder?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              folder and its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                await deleteFolder({ folderId: folder.id });
                setOpenDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
