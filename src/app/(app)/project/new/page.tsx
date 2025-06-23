"use client";

import { AccessGuard } from "@/components/access-guard";
import { FileUploader } from "@/components/file-uploader";
import { LoadingButton } from "@/components/loading-button";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useAddDocumentToProject,
  useCreateProject,
  useGetProjectsList,
} from "@/hooks/use-project";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  createProjectSchema,
  CreateProjectSchema,
} from "@/lib/zod/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { addDays, format } from "date-fns";
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CalendarIcon,
  FileTextIcon,
  FolderIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
  TimerIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useCreateDocument, useCreateFolder } from "@/hooks/use-document";

export default function NewProjectPage() {
  const minBudget = 100;

  // state
  const [pending, setPending] = useState(false);

  // hooks
  const uploadRef = useRef<{ startUpload: () => Promise<string | null> }>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { mutateAsync: createProjectAsync } = useCreateProject();
  const { mutateAsync: createFolderAsync } = useCreateFolder();
  const { mutateAsync: addDocumentToProjectAsync } = useAddDocumentToProject();
  const { mutateAsync: uploadDocumentAsync } = useCreateDocument();
  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: minBudget,
      timeline: { from: new Date(), to: addDays(new Date(), 7) },
    },
  });
  const { data: projects = [] } = useGetProjectsList({ title: "" });

  const onSubmit = async (data: CreateProjectSchema) => {
    const titleExists = projects.some(
      (project) =>
        project.title.toLowerCase() === data.title.toLowerCase().trim()
    );
    if (titleExists) {
      form.setError("title", {
        type: "manual",
        message: "A project with this title already exists.",
      });
      return;
    }
    setPending(true);
    const fileId = await uploadRef.current?.startUpload();
    try {
      const project = await createProjectAsync(
        {
          title: data.title,
          description: data.description,
          budget: data.budget,
          from: data.timeline.from,
          to: data.timeline.to,
          status: "Pending",
          createdBy: {
            connect: {
              id: session?.user.id,
            },
          },
        },
        {
          onSuccess: async () => {
            const folder = await createFolderAsync({ name: data.title });
            if (fileId) {
              const document = await uploadDocumentAsync({
                version: "v1",
                message: "Initial upload",
                document: {
                  create: {
                    title: `${data.title} Project Files`,
                    category: "Proposals",
                    documentFolder: {
                      connect: {
                        id: folder?.id,
                      },
                    },
                    archived: false,
                    createdBy: {
                      connect: {
                        id: session?.user.id,
                      },
                    },
                  },
                },
                createdBy: {
                  connect: {
                    id: session?.user.id,
                  },
                },
                attachment: {
                  connect: {
                    id: fileId,
                  },
                },
              });

              await addDocumentToProjectAsync({
                id: project.id,
                data: {
                  documents: {
                    connect: { id: document?.id },
                  },
                },
              });
            }
          },
        }
      );
    } catch (error) {
      toast.error("An error occured", {
        description: JSON.stringify(error, null, 2),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AccessGuard page="proposal" actions={["create"]}>
      <PageHeader>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="mr-2"
          onClick={() => router.push("/project")}
        >
          <ArrowLeftIcon />
        </Button>
        <div className="w-full">
          <PageHeaderHeading>Create New Project Proposal</PageHeaderHeading>
          <PageHeaderDescription>
            Submit a new CSR project proposal for approval
          </PageHeaderDescription>
        </div>
      </PageHeader>
      <Form {...form}>
        <form>
          <SectionWrapper className="py-2 flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Project Details
            </h3>
          </SectionWrapper>
          <SectionWrapper className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a title for your proposal"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1">
                    <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    A clear title helps us understand your project at a glance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      {...field}
                      placeholder="Describe your project goals, requirements, and any specific details"
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1">
                    <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Be as detailed as possible to help us understand your needs
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionWrapper>
          <SectionWrapper className="py-2 flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <BanknoteIcon className="h-4 w-4 mr-2" />
              Budget & Timeline
            </h3>
          </SectionWrapper>
          <SectionWrapper className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="rounded-r-none"
                        value={field.value || minBudget}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-none border-r-0"
                            onClick={() => {
                              const newBudget = Math.max(
                                minBudget,
                                (field.value || minBudget) - 100
                              );
                              form.setValue("budget", newBudget);
                            }}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Decrease budget</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-l-none border-r-1"
                            onClick={() => {
                              const newBudget =
                                (field.value || minBudget) + 100;
                              form.setValue("budget", newBudget);
                            }}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Increase budget</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormDescription className="flex items-center gap-1">
                    <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Minimum budget is Php{minBudget}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Timeline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {field.value.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "MMMM dd, yyyy")} -{" "}
                                {format(field.value.to, "MMMM dd, yyyy")}
                              </>
                            ) : (
                              format(field.value.from, "MMMM dd, yyyy")
                            )
                          ) : (
                            <span>Select project timeline</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="flex items-center gap-1">
                    <TimerIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Select the expected start and end dates for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionWrapper>
        </form>
      </Form>
      <SectionWrapper className="py-2 flex flex-col items-stretch w-full space-y-2">
        <h3 className="text-lg font-medium flex items-center">
          <FolderIcon className="h-4 w-4 mr-2" />
          Supporting Documents (Optional)
        </h3>
        <p className="flex items-center gap-1 text-muted-foreground text-sm">
          Documents uploaded here will be automatically saved to Document
          Repository
        </p>
        <FileUploader
          ref={uploadRef}
          acceptedFileTypes={[
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
          ]}
        />
      </SectionWrapper>
      <SectionWrapper>
        <LoadingButton
          pending={pending}
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid}
        >
          Submit Proposal
        </LoadingButton>
      </SectionWrapper>
    </AccessGuard>
  );
}
