"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Users, AlertCircle } from "lucide-react";
import { User } from "@prisma/client";
import { getInitials } from "@/lib/utils";
import { RoleDisplay, roleMap } from "@/components/role-display";
import { RoleKey } from "@/lib/permissions";

interface Project {
  createdById: string;
}

interface ParticipantsDialogProps {
  showParticipants: boolean;
  setShowParticipants: (show: boolean) => void;
  participants: User[];
  loadingParticipants: boolean;
  participantsError: boolean;
  project: Project;
}

export function ParticipantsDialog({
  showParticipants,
  setShowParticipants,
  participants,
  loadingParticipants,
  participantsError,
  project,
}: ParticipantsDialogProps) {
  return (
    <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Discussion Participants
          </DialogTitle>
          <DialogDescription>
            {participants.length > 0 &&
            !loadingParticipants &&
            !participantsError
              ? `${participants.length} ${
                  participants.length === 1 ? "person" : "people"
                } in this discussion`
              : "List of users in this discussion room."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-80 overflow-y-auto">
          {loadingParticipants ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : participantsError ? (
            <div className="flex items-center gap-2 p-4 text-center text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load participants</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((user) => {
                if (!user) return null;

                const isOwner = user.id === project.createdById;
                const displayName = user.name || user.email;

                const roles = user?.role?.split(",").map((r) => r.trim()) || [];

                const firstValidRole = roles.find((role) => {
                  return (
                    role in roleMap &&
                    roleMap[role as RoleKey].label !== roleMap.user.label
                  );
                });

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.image || "/placeholder.svg"}
                        alt={displayName}
                      />
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(user.name || "", user.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {user.name || "Anonymous"}
                        </p>
                        {isOwner && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}

                        <RoleDisplay role={firstValidRole as RoleKey} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setShowParticipants(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
