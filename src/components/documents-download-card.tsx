"use client";

import { FileTextIcon, ImageIcon, PaperclipIcon } from "lucide-react";
import { formatBytes, getTypeLabel } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import { Card, CardAction, CardHeader, CardTitle } from "./ui/card";
import { useDownload } from "@/hooks/use-upload";
import { preferredUploadService } from "@/config/site";
import { LoadingButton } from "./loading-button";
import { Badge } from "./ui/badge";

export function DocumentsDownloadCard({
  id,
  type,
  title,
  size,
  url,
  version,
  archived,
}: {
  id: string;
  type: string;
  title: string;
  size: number;
  url: string;
  restricted: boolean;
  version: string;
  archived: boolean;
  allowedRoles: string;
}) {
  const { data, isLoading } = useDownload(url);

  const getDocumentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <FileTextIcon className="h-5 w-5 text-red-500" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case "document":
        return <FileIcon className="h-5 w-5 text-green-500" />;
      default:
        return <PaperclipIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card key={id}>
      <CardHeader className="flex flex-row items-center gap-2">
        {getDocumentIcon(type)}
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            {title}{" "}
            <span className="text-xs text-muted-foreground">{version}</span>
            {archived && <Badge variant="default">Archived</Badge>}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {getTypeLabel(type)} • {formatBytes(size)}
          </p>
        </div>
        <CardAction className="ml-auto">
          <LoadingButton
            variant="outline"
            pending={isLoading || !data}
            onClick={() => {
              if (data) {
                if (preferredUploadService === "localStorage") {
                  const link = document.createElement("a");
                  link.href = data.localPath;
                  link.download = data.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  const downloadUrl = `/api/attachment/download/${
                    data.name
                  }?filename=${encodeURIComponent(title)}`;
                  const link = document.createElement("a");
                  link.href = downloadUrl;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
            }}
          >
            Download
          </LoadingButton>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
