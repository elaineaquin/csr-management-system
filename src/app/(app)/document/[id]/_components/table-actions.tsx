"use client";

import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { DocumentRepository, DocumentVersionView } from "@/types/document.type";
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  useGetDocumentVersions,
  useGetFolderPermission,
} from "@/hooks/use-document";
import { Button } from "@/components/ui/button";
import {
  ArchiveIcon,
  DownloadIcon,
  HistoryIcon,
  MoreHorizontal,
  Trash2Icon,
  UploadIcon,
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
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/file-uploader";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  addNewVersionSchema,
  AddNewVersionSchema,
} from "@/lib/zod/document.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateDocument,
  useDeleteDocument,
  useArchiveDocument,
} from "@/hooks/use-document";
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
import { useSession } from "@/lib/auth-client";

export function TableActions({
  documentRepo,
}: {
  documentRepo: DocumentRepository;
}) {
  // State
  const [showHistory, setShowHistory] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Hooks
  const uploaderRef = useRef<{ startUpload: () => Promise<string> }>(null);
  const { data: versions } = useGetDocumentVersions({
    documentId: documentRepo.id,
  });
  const { data: session } = useSession();
  const { mutateAsync: uploadNewVersion } = useCreateDocument();
  const { mutateAsync: updateDocument } = useArchiveDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { data: canEdit } = useGetFolderPermission({
    folderId: documentRepo.folderId,
    permissions: "WRITE",
  });
  const isOwner = documentRepo.createdById === session?.user.id;

  const form = useForm<AddNewVersionSchema>({
    resolver: zodResolver(addNewVersionSchema),
    defaultValues: {
      message: "",
      version: `v${parseInt(documentRepo.version.slice(1)) + 1}`,
    },
  });

  const handleDownload = () => {
    const toastId = toast.loading("Download started, please wait...");

    try {
      if (!documentRepo?.url) {
        toast.error("No download URL available.", { id: toastId });
        return;
      }

      const downloadUrl = `/api/download/${
        documentRepo.url
      }?filename=${encodeURIComponent(documentRepo.filename || "file")}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started successfully.", { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to start download.", { id: toastId });
    }
  };

  const handleVersionDownload = (version: DocumentVersionView) => {
    const toastId = toast.loading("Download started, please wait...");

    try {
      if (version.url) {
        const downloadUrl = `/api/download/${
          version.url
        }?filename=${encodeURIComponent(version.title)}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!", { id: toastId });
      } else {
        toast.error("Download URL not available.", { id: toastId });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to start download.", { id: toastId });
    }
  };

  const handleFileUpload = async (data: AddNewVersionSchema) => {
    try {
      const file = await uploaderRef.current?.startUpload();
      if (!file) {
        toast.error("Failed to upload new version");
        return;
      }
      await uploadNewVersion({
        version: data.version,
        message: data.message,
        document: {
          connect: {
            id: documentRepo.id,
          },
        },
        createdBy: {
          connect: {
            id: session?.user.id,
          },
        },
        attachment: {
          connect: {
            id: file,
          },
        },
      });
      setShowUpload(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload new version");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={() => handleDownload()}
      >
        <DownloadIcon className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowHistory(true)}>
            <HistoryIcon className="mr-2 h-4 w-4" />
            Version history
          </DropdownMenuItem>
          {!documentRepo.archived && (isOwner || canEdit === true) && (
            <DropdownMenuItem onClick={() => setShowUpload(true)}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload new version
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          {(canEdit || isOwner) &&
            (documentRepo.archived ? (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <ArchiveIcon className="mr-2 h-4 w-4" />
                      Restore document
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will restore the document from the archive. The
                        document will be available again in the main documents
                        section.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await updateDocument({
                            id: documentRepo.id,
                            data: { archived: false },
                          });
                        }}
                      >
                        Restore
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2Icon className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-red-600">Delete permanently</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the document and all its versions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await deleteDocument({ id: documentRepo.id });
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ArchiveIcon className="mr-2 h-4 w-4" />
                    Archive document
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive the document. You can restore it later
                      from the archived documents section.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await updateDocument({
                          id: documentRepo.id,
                          data: { archived: true },
                        });
                      }}
                    >
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
              <DialogDescription>
                View and manage document versions
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="space-y-4 mt-4 max-h-[500px]">
              {versions?.map((version) => (
                <Card key={version.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {version.title}
                      <span className="text-sm font-bold">
                        {version.version}{" "}
                        {documentRepo.version === version.version && (
                          <Badge variant="default" className="ml-auto">
                            Current
                          </Badge>
                        )}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 italic truncate">
                      {version.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Uploaded by{" "}
                      <span className="font-medium">{version.createdBy}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <CardAction>
                      <Button
                        variant={"link"}
                        onClick={() => handleVersionDownload(version)}
                        className="focus:ring-0"
                      >
                        <DownloadIcon className="h-4 w-4" />
                        Download File
                      </Button>
                    </CardAction>
                  </CardFooter>
                </Card>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {showUpload && (
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Version</DialogTitle>
              <DialogDescription>
                Upload a new version of this document
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFileUpload)}
                className="mt-4 flex flex-col gap-4"
              >
                <FormItem>
                  <FormLabel>Version message</FormLabel>
                  <Input
                    {...form.register("message")}
                    placeholder="Version message"
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Upload new version</FormLabel>
                  <FileUploader
                    ref={uploaderRef}
                    acceptedFileTypes={[
                      "application/pdf",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
                    ]}
                    onUploadError={(err) =>
                      toast.error("Error on uploading files", {
                        description: err,
                      })
                    }
                  />
                </FormItem>
                <Button className="w-full" variant="outline">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload new Version
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
