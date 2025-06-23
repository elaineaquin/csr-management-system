"use client";

import { PageHeader } from "@/components/page-header";
import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useApproveVolunteer,
  useCloseVolunteerRequest,
  useGetProjectRequestById,
  useRejectVolunteer,
  useUpdateVolunteerRequest,
} from "@/hooks/use-volunteer";
import {
  ArrowLeftIcon,
  CalendarIcon,
  DollarSignIcon,
  UserIcon,
  UsersIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, getVolunteerRequestStatusColor } from "@/lib/utils";
import { format } from "date-fns";
import { ButtonGuard } from "@/components/button-guard";
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
import { useSession } from "@/lib/auth-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { VolunteerApplicationForm } from "@/components/application-form";
import { EditAvailabilityDialog } from "@/components/edit-availability";
import { VolunteerCard } from "../../_components/volunteer-card";
import { toast } from "sonner";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { mutateAsync: closeRequest } = useCloseVolunteerRequest();
  const { mutateAsync: updateRequest } = useUpdateVolunteerRequest();
  const { mutateAsync: approveVolunteer } = useApproveVolunteer();
  const { mutateAsync: rejectVolunteer } = useRejectVolunteer();
  const { data, isLoading, error, refetch } = useGetProjectRequestById({
    id: id as string,
  });
  const [editRequestDialogOpen, setEditRequestDialogOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState("");
  const [editedLimit, setEditedLimit] = useState(1);
  const [showAvailability, setShowAvailability] = useState(false);
  const isOwner = data?.createdById === session?.user.id;

  useEffect(() => {
    if (data) {
      setEditedMessage(data.message ?? "");
      setEditedLimit(data.participantLimit ?? 1);
    }
  }, [data]);

  // Loading skeleton
  if (isLoading || !data) {
    return (
      <>
        <PageHeader>
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeftIcon />
          </Button>
          <div className="w-full">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-6 w-24" />
        </PageHeader>
        <SectionWrapper>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Separator />
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Separator />
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-2 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full mb-4 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </SectionWrapper>
      </>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="mx-auto max-w-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We couldn&apos;t load the project details. Please try again later.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.back()}>Go Back</Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => router.refresh()}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const handleSaveAvailability = async () => {
    await refetch();
  };

  return (
    <>
      <PageHeader>
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="w-full">
          <h1 className="text-2xl font-bold">{data.project.title}</h1>
          <p className="text-muted-foreground">Project Request Details</p>
        </div>
        <Badge className={getVolunteerRequestStatusColor(data.status)}>
          {data.status}
        </Badge>
      </PageHeader>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: data.project.description,
                    }}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">
                        {formatCurrency(data.project.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Participant Limit
                      </p>
                      <p className="font-semibold">{data.participantLimit}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.volunteers.length > 0 ? (
                  <ScrollArea className="max-h-[800px] space-y-2">
                    {data.volunteers.map((volunteer) => {
                      const isUser = volunteer.userId === session?.user.id;
                      return (
                        <div key={volunteer.id}>
                          <VolunteerCard
                            isOwner={isOwner}
                            volunteer={volunteer}
                            isCurrentUser={isUser}
                            onEditAvailability={() => setShowAvailability(true)}
                            onApprove={async (volunteerId) => {
                              toast.promise(
                                approveVolunteer(volunteerId).then(() =>
                                  refetch()
                                ),
                                {
                                  loading: "Approving volunteer...",
                                  success: "Volunteer approved!",
                                  error: "Failed to approve volunteer.",
                                }
                              );
                            }}
                            onReject={async (volunteerId) => {
                              toast.promise(
                                rejectVolunteer(volunteerId).then(() =>
                                  refetch()
                                ),
                                {
                                  loading: "Rejecting volunteer...",
                                  success: "Volunteer rejected!",
                                  error: "Failed to reject volunteer.",
                                }
                              );
                            }}
                          />
                          <EditAvailabilityDialog
                            volunteerId={volunteer.id}
                            initialAvailability={volunteer.availability.map(
                              (a) => a.day
                            )}
                            onSave={handleSaveAvailability}
                            open={showAvailability}
                            onOpenChange={setShowAvailability}
                          />
                        </div>
                      );
                    })}
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6">
                    <UsersIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      No volunteers yet
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Be the first to join this project!
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!isOwner && (
                  <ButtonGuard name="volunteer" actions={["participate"]}>
                    <VolunteerApplicationForm
                      requestId={data.id}
                      requestStatus={data.status}
                    />
                  </ButtonGuard>
                )}
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Project Start
                    </p>
                    <p className="font-semibold">
                      {format(data.project.from, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project End</p>
                    <p className="font-semibold">
                      {format(data.project.to, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Request Created
                    </p>
                    <p className="font-semibold">
                      {format(data.createdAt, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-semibold">
                      {format(data.updatedAt, "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Request Details
                </CardTitle>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditRequestDialogOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-semibold">{data.createdBy.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Request Message
                  </p>
                  <p>{data.message}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Participants
                  </p>
                  <p className="font-semibold">
                    {data.totalParticipants} / {data.participantLimit}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Project Status
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {data.project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {isOwner && data.totalParticipants >= data.participantLimit && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <UsersIcon className="h-5 w-5" />
                    Participant Limit Reached
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Participant capacity has been reached. You may now close
                    this request to prevent further applications and begin the{" "}
                    <span className="font-medium">Ongoing</span> phase of the
                    project.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      await closeRequest({ id: data.id });
                      await refetch();
                    }}
                    disabled={data.status === "Closed"}
                  >
                    Close Request
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </SectionWrapper>

      <AlertDialog
        open={editRequestDialogOpen}
        onOpenChange={setEditRequestDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Request Details</AlertDialogTitle>
            <AlertDialogDescription>
              Modify your request message or participant limit and save the
              changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Edit request message"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div>
              <label className="block mb-1 font-medium text-sm">
                Participant Limit
              </label>
              <input
                type="number"
                min={1}
                value={editedLimit}
                onChange={(e) => setEditedLimit(parseInt(e.target.value) || 1)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditRequestDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await updateRequest({
                  id: data.id,
                  message: editedMessage,
                  participantLimit: editedLimit,
                });
                setEditRequestDialogOpen(false);
                refetch();
              }}
              disabled={!editedMessage.trim()}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
