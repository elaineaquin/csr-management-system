"use client";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FileTextIcon,
  RefreshCwIcon,
  TrashIcon,
  Users2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetProject,
  useDeleteProject,
  useUpdateProject,
  useCreateParticipantRequest,
} from "@/hooks/use-project";
import { useParams, useRouter } from "next/navigation";
import { SectionWrapper } from "@/components/section-wrapper";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
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
import { UserInfoCard } from "@/components/user-info-card";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Checked from "@/components/checked";
import { ButtonGuard } from "@/components/button-guard";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VolunteerList } from "./_components/volunteer-list";
import Link from "next/link";
import { ProjectHistory } from "./_components/project-history";

export default function ProjectDetailsPage() {
  // hooks
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading, error, refetch } = useGetProject({
    id: id as string,
  });
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { mutateAsync: updateProject, isPending: isUpdating } =
    useUpdateProject();
  const { mutateAsync: createRequest } = useCreateParticipantRequest();

  // states
  const [requestId, setRequestId] = useState(data?.requestId || "");
  const [hasVolunteerRequest, setHasVolunteerRequest] = useState(
    data?.hasVolunteerRequest || false
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [requestVolunteerDialogOpen, setRequestVolunteerDialogOpen] =
    useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [volunteerMessage, setVolunteerMessage] = useState("");
  const [participantLimit, setParticipantLimit] = useState(1); // default to 1
  const [revisionRequest, setRevisionRequest] = useState("");
  const [needsAttention, setNeedsAttention] = useState(
    data?.needsAttention || false
  );
  const isOwner = data?.createdById === session?.user.id;

  useEffect(() => {
    if (data) {
      setRequestId(data.requestId || "");
      setHasVolunteerRequest(data.hasVolunteerRequest || false);
      setNeedsAttention(data.needsAttention);
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

  const onHandleRevisionRequest = async () => {
    try {
      await updateProject({
        id: data.id,
        data: {
          status: "Revision",
          revisionReason: revisionRequest,
          revisionRequest: true,
        },
      });
      setRevisionRequest("");
      setRevisionDialogOpen(false);
      refetch();
      toast.success("Revision request submitted successfully");
    } catch (error) {
      toast.error("Failed to update project", { description: `${error}` });
    }
  };

  const onHandleRejectProposal = async () => {
    try {
      await updateProject({
        id: data.id,
        data: {
          status: "Rejected",
          rejectedReason: rejectionReason,
        },
      });
      setRejectionReason("");
      setRejectDialogOpen(false);
      refetch();
      toast.success("Proposal rejected successfully");
    } catch (error) {
      toast.error("Failed to reject proposal", { description: `${error}` });
    }
  };

  const onHandleApproveProposal = async () => {
    try {
      await updateProject({
        id: data.id,
        data: {
          status: "Approved",
        },
      });
      setApproveDialogOpen(false);
      refetch();
      toast.success("Proposal approved successfully");
    } catch (error) {
      toast.error("Failed to approve proposal", { description: `${error}` });
    }
  };

  const onHandleCompleteProposal = async () => {
    try {
      await updateProject({
        id: data.id,
        data: {
          status: "Completed",
        },
      });
      setCompleteDialogOpen(false);
      refetch();
      toast.success("Project marked as completed successfully");
    } catch (error) {
      toast.error("Failed to mark project as completed", {
        description: `${error}`,
      });
    }
  };

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

  return (
    <>
      <PageHeader className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PageHeaderHeading className="flex items-center gap-2">
              {data.title || "Project Details"}{" "}
              {data.status === "Approved" && <Checked />}
            </PageHeaderHeading>
            <Badge variant="outline">{data.status}</Badge>
          </div>
          <PageHeaderDescription>
            Comprehensive information about the proposed project
          </PageHeaderDescription>
        </div>
        <div className="flex gap-2">
          {(data.status === "Ongoing" || data.status === "HighRisk") && (
            <Button asChild>
              <Link href={`/project/${id}/kanban`}>Open Kanban</Link>
            </Button>
          )}
          <ButtonGuard name="proposal" actions={["delete"]} isOwner={isOwner}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the project and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteProject({ id: id as string })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ButtonGuard>
        </div>
      </PageHeader>
      <SectionWrapper>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteers</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
            <div className="md:col-span-2 h-fit space-y-4">
              <Card>
                <CardContent>
                  <TabsContent value="overview">
                    <div className="space-y-6 pt-6">
                      {/* Description */}
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-3">
                          <FileTextIcon className="h-5 w-5 text-primary" />
                          Description
                        </CardTitle>
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: data.description }}
                        />
                      </div>

                      <Separator />

                      <div>
                        <CardTitle className="flex items-center gap-2 mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-emerald-500"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                            <path d="M12 18V6" />
                          </svg>
                          Budget
                        </CardTitle>
                        <p className="text-xl font-semibold text-emerald-500 dark:text-emerald-400">
                          {formatCurrency(data.budget)}
                        </p>
                      </div>

                      <Separator />

                      {/* Timeline */}
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-3">
                          <CalendarIcon className="h-5 w-5 text-blue-500" />
                          Timeline
                        </CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-dashed">
                            <CardContent>
                              <div className="flex items-center gap-2 mb-2">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  Project Duration
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <div className="font-semibold">
                                    {format(new Date(data.from), "MMM d, yyyy")}
                                  </div>
                                  <div className="text-muted-foreground">
                                    Start Date
                                  </div>
                                </div>
                                <div className="text-center text-muted-foreground">
                                  to
                                </div>
                                <div className="text-sm text-right">
                                  <div className="font-semibold">
                                    {format(new Date(data.to), "MMM d, yyyy")}
                                  </div>
                                  <div className="text-muted-foreground">
                                    End Date
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-dashed">
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Activity</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <div className="text-muted-foreground">
                                    Created
                                  </div>
                                  <div className="font-medium">
                                    {format(
                                      new Date(data.createdAt),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(data.createdAt), "h:mm a")}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Last Updated
                                  </div>
                                  <div className="font-medium">
                                    {format(
                                      new Date(data.updatedAt),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(data.updatedAt), "h:mm a")}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Separator />

                      {/* Documents */}
                      {/* <div>
												<CardTitle className="flex items-center gap-2 mb-3">
													<PaperclipIcon className="h-5 w-5 text-purple-500" />
													Documents
												</CardTitle>
												{data.documents.length === 0 ? (
													<div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl">
														<FileIcon className="h-10 w-10 text-muted-foreground mb-2" />
														<p className="text-muted-foreground">No documents available for this project.</p>

														<AddDocumentDialog
															documents={documents || []}
															existingDocuments={data.documents}
															selectedDocs={selectedDocs}
															setSelectedDocs={setSelectedDocs}
															searchQuery={searchQuery}
															onHandleAddDocument={onHandleAddDocument}
															setSearchQuery={setSearchQuery}
														/>
													</div>
												) : (
													<div className="flex flex-col gap-2">
														{data.documents.map((doc) => (
															<DocumentsDownloadCard key={doc.id} {...doc} />
														))}
													</div>
												)}
												<AddDocumentDialog
													documents={documents || []}
													existingDocuments={data.documents}
													selectedDocs={selectedDocs}
													setSelectedDocs={setSelectedDocs}
													searchQuery={searchQuery}
													onHandleAddDocument={onHandleAddDocument}
													setSearchQuery={setSearchQuery}
												/>
											</div> */}
                    </div>
                  </TabsContent>
                  <TabsContent value="volunteer">
                    <VolunteerList id={data.id} />
                  </TabsContent>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => router.back()}>
                    Back to Projects
                  </Button>
                </CardFooter>
              </Card>
              <ProjectHistory id={data.id} />
            </div>
            <div className="h-fit grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-blue-500" />
                    Submission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      Submitted By
                    </p>
                    <UserInfoCard
                      userId={data.createdById}
                      userName={data.createdBy}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      Submission Date
                    </p>
                    <p className="text-sm">
                      {format(new Date(data.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  {data.status === "Rejected" && data.rejectedReason && (
                    <Alert>
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>Rejection Reason</AlertTitle>
                      <AlertDescription>{data.rejectedReason}</AlertDescription>
                    </Alert>
                  )}
                  {data.status === "Revision" && data.revisionRequest && (
                    <Alert>
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>Revision Request</AlertTitle>
                      <AlertDescription>{data.revisionReason}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
              {isOwner && data.status !== "Completed" && (
                <div className="h-fit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircleIcon className="h-4 w-4" />
                        Needs Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Label>Mark this project as needing attention</Label>
                      <Switch
                        checked={needsAttention}
                        onCheckedChange={async (checked) => {
                          setNeedsAttention(checked);
                          await updateProject({
                            id: data.id,
                            data: {
                              needsAttention: checked,
                            },
                          });
                          await refetch();
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
              {data.status == "Pending" && (
                <ButtonGuard
                  name="proposal"
                  actions={["approve", "request-revision", "reject"]}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheckIcon className="h-5 w-5 text-green-500" />
                        Review Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <AlertDialog
                          open={approveDialogOpen}
                          onOpenChange={setApproveDialogOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="default"
                              className="w-full justify-start bg-green-800 dark:bg-green-400"
                            >
                              <CheckIcon className="mr-2 h-4 w-4" />
                              Approve Proposal
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Approve Proposal
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this proposal?
                                You can still change it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={onHandleApproveProposal}
                              >
                                {isUpdating ? "Approving..." : "Approve"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={() => setRejectDialogOpen(true)}
                        >
                          <XIcon className="mr-2 h-4 w-4" />
                          Reject Proposal
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() => setRevisionDialogOpen(true)}
                        >
                          <RefreshCwIcon className="mr-2 h-4 w-4" />
                          Request Revisions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ButtonGuard>
              )}
              {isOwner && data.status === "Revision" && (
                <ButtonGuard name="proposal" actions={["revise"]}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCwIcon className="h-5 w-5 text-blue-500" />
                        Revision Required
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        This project needs revisions. Click below to start the
                        revision process.
                      </p>
                      <Button
                        variant="default"
                        className="w-full justify-start"
                        onClick={() =>
                          router.push(`/project/${data.id}/revision`)
                        }
                      >
                        Start Revision Process
                      </Button>
                    </CardContent>
                  </Card>
                </ButtonGuard>
              )}
              {(data.status === "Ongoing" || data.status === "HighRisk") && (
                <ButtonGuard name="proposal" actions={["complete"]}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                        Mark as Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        This project has been approved. Click below to mark it
                        as completed.
                      </p>
                      <Button
                        variant="default"
                        className="w-full justify-start"
                        onClick={() => setCompleteDialogOpen(true)}
                      >
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                </ButtonGuard>
              )}
              {isOwner &&
                data.status === "Approved" &&
                !hasVolunteerRequest && (
                  <div className="h-fit">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users2Icon className="h-4 w-4" />
                          Request Volunteers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Invite participants to support this project. A
                          notification will be sent to available participants.
                        </p>

                        <Button
                          variant="default"
                          className="w-full justify-start"
                          onClick={() => setRequestVolunteerDialogOpen(true)}
                        >
                          Request Participants
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              {hasVolunteerRequest && (
                <div className="h-fit mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users2Icon className="h-4 w-4" />
                        Volunteer Request
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        A volunteer request has been made for this project.
                        Click below to view the post or see more details.
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/project/participate/${requestId}`}>
                          View Post
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </SectionWrapper>

      <AlertDialog
        open={requestVolunteerDialogOpen}
        onOpenChange={setRequestVolunteerDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Participant Request</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be sent to available participants. You can
              customize it before sending.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Add message"
              value={volunteerMessage}
              onChange={(e) => setVolunteerMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={isUpdating}
            />
            <div>
              <label className="block mb-1 font-medium text-sm">
                Participant Limit
              </label>
              <input
                type="number"
                min={1}
                value={participantLimit}
                onChange={(e) =>
                  setParticipantLimit(parseInt(e.target.value) || 1)
                }
                disabled={isUpdating}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setVolunteerMessage("");
                setParticipantLimit(1);
                setRequestVolunteerDialogOpen(false);
              }}
              disabled={isUpdating}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const request = await createRequest({
                  message: volunteerMessage,
                  participantLimit: Number(participantLimit),
                  status: "Open",
                  project: {
                    connect: {
                      id: data.id,
                    },
                  },
                  createdBy: {
                    connect: {
                      id: session?.user.id,
                    },
                  },
                });
                setHasVolunteerRequest(true);
                setRequestId(request.id);
                setVolunteerMessage("");
                // router.push('/project'); // redire
              }}
              disabled={!volunteerMessage.trim()}
            >
              {isUpdating ? "Sending..." : "Send Message"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Proposal Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this proposal. This will be
              shared with the project creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onHandleRejectProposal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!rejectionReason.trim()}
            >
              {isUpdating ? "Rejecting..." : "Reject Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Revisions Dialog */}
      <AlertDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Revisions</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide details about the required revisions. This will be
              shared with the project creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter revision request details..."
              value={revisionRequest}
              onChange={(e) => setRevisionRequest(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRevisionRequest("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onHandleRevisionRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!revisionRequest.trim()}
            >
              {isUpdating ? "Submitting..." : "Submit Revision Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Proposal Dialog */}
      <AlertDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that you want to mark this project as completed. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onHandleCompleteProposal}>
              {isUpdating ? "Completing..." : "Complete Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
