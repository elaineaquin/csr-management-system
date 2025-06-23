"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import {
  acceptInviteLink,
  checkFolderPermission,
  createNewDocument,
  createNewFolder,
  deleteDocument,
  deleteFolder,
  findFolderName,
  generateInviteLink,
  getDocumentById,
  getDocuments,
  getDocumentVersions,
  getFolders,
  removeInviteLink,
  shareDocuments,
  updateDocument,
  updateRestrictions,
} from "@/server/document";
import { useSendNotification } from "./use-notification";
import { DocumentPermission } from "@/lib/zod/document.schema";

export function useCreateDocument() {
  return useMutation({
    mutationKey: ["create-document"],
    mutationFn: async (params: Prisma.DocumentVersionCreateInput) => {
      return await createNewDocument(params);
    },
  });
}

export function useGetDocuments(params: { id: string }) {
  return useQuery({
    queryKey: ["get-all-documents", params],
    queryFn: async () => {
      const result = await getDocuments(params);
      return result ?? null;
    },

    gcTime: 0, // Disable garbage collection (effectively disables caching)
    staleTime: 0, // Consider data immediately stale
  });
}

export function useGetDocument(params: { id: string }) {
  return useQuery({
    queryKey: ["document", params],
    queryFn: async () => {
      const documents = await getDocumentById(params);
      return documents ?? [];
    },
    gcTime: 0, // Disable garbage collection (effectively disables caching)
    staleTime: 0, // Consider data immediately stale
  });
}

export function useArchiveDocument() {
  return useMutation({
    mutationKey: ["archive-document"],
    mutationFn: async (params: {
      id: string;
      data: Prisma.DocumentUpdateInput;
    }) => {
      const { id, data } = params;
      return await updateDocument(id, {
        ...(data.archived !== undefined && { archived: data.archived }),
      });
    },
    onSuccess: (data) => {
      toast.success(`Document ${data.archived ? "archived" : "unarchived"}`);
    },
  });
}

export function useDeleteDocument() {
  return useMutation({
    mutationKey: ["delete-document"],
    mutationFn: async (params: { id: string }) => {
      return await deleteDocument(params);
    },
    onSuccess: (data) => {
      toast.success(`Document ${data.title} has been deleted`);
    },
    onError: (error) => {
      toast.error("Failed to delete document", {
        description: error.message,
      });
    },
  });
}

export function useGetDocumentVersions(params: { documentId: string }) {
  return useQuery({
    queryKey: ["document-versions", params],
    queryFn: async () => {
      const versions = await getDocumentVersions(params);
      return versions ?? [];
    },
    enabled: !!params.documentId,
    gcTime: 0,
    staleTime: 0,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-folders"] });
    },
  });
}

export function useGetFolders() {
  return useQuery({
    queryKey: ["get-folders"],
    queryFn: async () => {
      const folders = await getFolders();
      return folders ?? [];
    },
  });
}

export function useGetFolderPermission(params: {
  folderId: string;
  permissions: DocumentPermission;
}) {
  return useQuery({
    queryKey: ["get-folder-permisssion", params],
    queryFn: async () => {
      const canDoActions = await checkFolderPermission(params);
      return canDoActions ?? false;
    },
  });
}

export function useShareDocuments() {
  const { mutateAsync: sendNotificationAsync } = useSendNotification();
  return useMutation({
    mutationFn: shareDocuments,
    onSuccess: async (data) => {
      if (data.success) {
        await Promise.all(
          data.shared.map((user) =>
            sendNotificationAsync({
              user: {
                connect: {
                  id: user.id,
                },
              },
              message: `You've been added to folder "${data.folderName}"`,
              link: `/document/${data.folderId}`,
            })
          )
        );
        toast.success("Users added");
      }
    },
    onError: (error) => {
      toast.error("Failed to share folder", {
        description: error.message,
      });
    },
  });
}

export function useUpdateDocumentRestriction() {
  return useMutation({
    mutationFn: updateRestrictions,
  });
}

export function useDeleteDocumentFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-folders"] });
    },
  });
}

export function useFindFolderByName(params: { name: string }) {
  return useQuery({
    queryKey: ["find-folder-by-name", params],
    queryFn: async () => {
      const folder = await findFolderName(params);
      return folder ?? null;
    },
  });
}

export const useGenerateInviteLink = () => {
  return useMutation({
    mutationFn: generateInviteLink,
  });
};

export const useRemoveInviteLink = () => {
  return useMutation({
    mutationFn: removeInviteLink,
  });
};

export const useAcceptInviteLink = (params: { token: string }) => {
  return useQuery({
    queryKey: ["accept-invite", params],
    queryFn: async () => {
      const result = await acceptInviteLink(params);
      return result ?? null;
    },
    enabled: !!params.token,
  });
};
