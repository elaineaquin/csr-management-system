import { useMutation, useQuery } from "@tanstack/react-query";
import { Attachment } from "@prisma/client";
import axios from "axios";

export function useUpload(setProgress?: (val: number) => void) {
  return useMutation({
    mutationKey: ["upload-attachment"],
    mutationFn: async (file: File) => {
      if (!file || !(file instanceof File)) {
        return;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress?.(percent);
            }
          },
        });
        return response.data as Attachment;
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload file");
      }
    },
  });
}

export function useDownload(attachmentId: string | null) {
  return useQuery({
    queryKey: ["use-download", { attachmentId }],
    queryFn: async () => {
      const response = await fetch(`/api/attachment/upload/${attachmentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attachment");
      }
      return await response.json();
    },
    enabled: !!attachmentId,
    gcTime: 0,
    staleTime: 0,
  });
}
