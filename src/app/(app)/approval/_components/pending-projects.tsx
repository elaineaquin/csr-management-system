"use client";

import { ButtonGuard } from "@/components/button-guard";
import { ChatContainer } from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { UserInfoCard } from "@/components/user-info-card";
import {
  useGetProjectDiscussionRoomId,
  useGetProjectParticipants,
  useGetProjectsList,
} from "@/hooks/use-project";
import { useSession } from "@/lib/auth-client";
import { ProjectWithCreator } from "@/types/project.type";
import { EyeIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PendingProjects() {
  const { data: projects, isLoading } = useGetProjectsList({
    status: "Pending",
    title: "",
  });

  if (isLoading || !projects) {
    return <div>Loading, please wait...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) => (
        <PendingProject project={project} key={project.id} />
      ))}
    </div>
  );
}

export function PendingProject({ project }: { project: ProjectWithCreator }) {
  const [openDiscussion, setOpenDiscussion] = useState(false);
  const {
    data: room,
    isLoading: loadingRoom,
    error: roomError,
  } = useGetProjectDiscussionRoomId({
    id: project.id,
  });

  const {
    data: participants = [],
    isLoading: loadingParticipants,
    error: participantsError,
  } = useGetProjectParticipants({
    projectId: project.id,
  });
  const [showParticipants, setShowParticipants] = useState(false);
  const { data: session } = useSession();
  const handleGetProjectDiscussion = () => {
    setOpenDiscussion(true);
  };

  const isOwner = session?.user.id === project.createdById;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href={`/project/${project.id}`} className="hover:underline">
              {project.title}
            </Link>
          </CardTitle>
          <CardDescription>Created By: {project.createdBy}</CardDescription>
          <CardAction className="flex items-center gap-2">
            <ButtonGuard
              name="approvalAndComs"
              actions={["chat"]}
              isOwner={isOwner}
            >
              <Button onClick={handleGetProjectDiscussion}>
                Open Discussion
              </Button>
            </ButtonGuard>
            <Button variant={"secondary"} size={"icon"} asChild>
              <Link href={`/project/${project.id}`}>
                <EyeIcon />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Discussion Drawer */}
      <Drawer
        direction="right"
        open={openDiscussion}
        onOpenChange={setOpenDiscussion}
      >
        <DrawerContent>
          <DrawerHeader className="border-b-2">
            <DrawerTitle>{project.title}</DrawerTitle>
            <DrawerDescription>Project Discussions</DrawerDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(true)}
            >
              View Participants
            </Button>

            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="p-4 h-full overflow-y-auto flex">
            {loadingRoom ? (
              <div className="text-sm text-muted-foreground">
                Loading discussion room...
              </div>
            ) : room?.id ? (
              <ChatContainer roomId={room.id} />
            ) : roomError ? (
              <div className="text-red-500">Error loading discussion room</div>
            ) : (
              <div className="text-red-500">Room not found</div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Participants Dialog */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discussion Participants</DialogTitle>
            <DialogDescription>
              List of users in this discussion room.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            {loadingParticipants ? (
              <div className="text-sm text-muted-foreground">
                Loading participants...
              </div>
            ) : participantsError ? (
              <div className="text-red-500">Error loading participants</div>
            ) : participants.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No participants found.
              </p>
            ) : (
              participants.map((user) => {
                if (!user) return null; // Handle case where user is undefined
                return (
                  <div key={user.id} className="flex items-center gap-2">
                    <UserInfoCard
                      userId={user.id}
                      userName={user.name || user.email}
                    />
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowParticipants(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
