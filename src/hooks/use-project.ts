"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  useSendBroadcastNotification,
  useSendNotification,
} from "./use-notification";
import { Prisma, ProjectStatusType } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getDashboardOverview,
  getProjectHistory,
  createRequestParticipants,
  createProjectHistory,
  getProjectDiscussionRoom,
} from "@/server/project";

export function useGetProjectsList(params: {
  title: string;
  status?: ProjectStatusType;
  userOnly?: boolean;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["project-list", params],
    queryFn: async () => {
      const title = params.title || "";
      const statusFilter = params.status || undefined;
      const userId = params.userOnly ? session?.user.id : undefined;

      const results = await getProjects({
        title,
        userId: userId,
        statusFilter,
      });
      return results ?? [];
    },
    gcTime: 0,
    staleTime: 0,
  });
}

export function useCreateProject() {
  const router = useRouter();
  const { mutateAsync: sendBroadcastAsync } = useSendBroadcastNotification();
  return useMutation({
    mutationKey: ["create-project"],
    mutationFn: async (params: Prisma.ProjectCreateInput) => {
      return await createProject(params);
    },
    onSuccess: async (data) => {
      await sendBroadcastAsync({
        roles: ["u1", "u2", "u4", "admin"],
        link: `/project/${data.id}`,
        message: `A new project "${data.title}" has been submitted and is under review`,
      });
      router.push("/project");
    },
    onError: (error: Error) => {
      toast.error("Failed to create project", {
        description: error.message,
      });
    },
  });
}

export function useAddDocumentToProject() {
  return useMutation({
    mutationKey: ["add-document-to-project"],
    mutationFn: async (params: {
      id: string;
      data: Prisma.ProjectUpdateInput;
    }) => {
      const { id, data } = params;
      return await updateProject(id, data);
    },
    onSuccess: async () => {
      toast.success("Documents added successfully");
    },
  });
}

export function useGetProject(params: { id: string }) {
  return useQuery({
    queryKey: ["project", params],
    queryFn: async () => {
      const result = await getProjectById(params);
      return result ?? null;
    },
    enabled: !!params.id,
    gcTime: 0,
    staleTime: 0,
  });
}

export function useGetProjectHistory(params: { id: string }) {
  return useQuery({
    queryKey: ["project-history", params],
    queryFn: async () => {
      const histories = await getProjectHistory(params);
      return histories ?? [];
    },
    enabled: !!params.id,
  });
}

export function useDeleteProject() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutateAsync: sendNotificationAsync } = useSendNotification();
  return useMutation({
    mutationKey: ["delete-project"],
    mutationFn: async (params: { id: string }) => {
      const { id } = params;
      const project = await getProjectById({ id });
      await deleteProject({ id });
      return project;
    },
    onSuccess: async (data) => {
      const deleterName = session?.user.name || "Unknown user";
      if (data.createdById) {
        await sendNotificationAsync({
          user: {
            connect: { id: data.createdById },
          },
          message: `${deleterName} has deleted the project "${data.title}"`,
        });
      }
      router.push("/project");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete project", {
        description: error.message,
      });
    },
  });
}

export function useUpdateProject() {
  const { data: session } = useSession();
  const { mutateAsync: sendNotificationAsync } = useSendNotification();
  const { mutateAsync: addHistory } = useAddProjectHistory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-project"],
    mutationFn: async (params: {
      id: string;
      data: Prisma.ProjectUpdateInput;
    }) => {
      const { id, data } = params;
      return await updateProject(id, data);
    },
    onSuccess: async (data) => {
      toast.success("Project updated successfully", {
        description: `Project "${data.title}" has been ${
          data.status === "Revision" ? "requested for revision" : data.status
        } by ${session?.user.name}`,
      });

      if (data.createdById) {
        await sendNotificationAsync({
          user: {
            connect: { id: data.createdById },
          },
          message: `Your project "${data.title}" has been ${
            data.status === "Revision" ? "requested for revision" : data.status
          } by ${session?.user.name}`,
          link: `/project/${data.id}`,
        });
        await addHistory({
          project: { connect: { id: data.id } },
          title: `Project Updated`,
          subtitle: `Project "${data.title}" has been ${
            data.status === "Revision" ? "requested for revision" : data.status
          } by ${session?.user.name}`,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["project-list"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["project", { id: data.id }] });
    },
  });
}

export function useReviseProject() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: sendBroadcastAsync } = useSendBroadcastNotification();
  const { mutateAsync: addHistory } = useAddProjectHistory();
  return useMutation({
    mutationKey: ["revise-project"],
    mutationFn: async (params: {
      id: string;
      data: Prisma.ProjectUpdateInput;
    }) => {
      const { id, data } = params;
      return await updateProject(id, data);
    },
    onSuccess: async (data) => {
      toast.success("Project revised successfully");
      await queryClient.invalidateQueries({
        queryKey: ["project", { id: data.id }],
      });
      await sendBroadcastAsync({
        roles: ["u1", "u2", "u4", "admin"],
        link: `/project/${data.id}`,
        message: `The project "${data.title}" has been revised`,
      });
      await addHistory({
        project: { connect: { id: data.id } },
        title: "Project Revised",
        subtitle: `The project "${data.title}" has been revised`,
      });
      router.push(`/project/${data.id}`);
    },
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const overview = await getDashboardOverview();
      return (
        overview ?? {
          totalProjects: 0,
          completedProjects: 0,
          availableBudget: 0,
          volunteersCount: 0,
          recentProjects: [],
          categoryMap: [],
          recentVolunteerRequests: [],
        }
      );
    },
  });
}

export function useCreateParticipantRequest() {
  const { mutateAsync: sendBroadcastAsync } = useSendBroadcastNotification();
  const { mutateAsync: addHistory } = useAddProjectHistory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-participant-request"],
    mutationFn: createRequestParticipants,
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["project", { id: data.id }] });
      await sendBroadcastAsync({
        roles: ["u5"],
        link: `/project/participate/${data.id}`,
        message: `A new project "${data.title}" has been opened for participants`,
      });
      await addHistory({
        project: { connect: { id: data.projectId } },
        title: "Volunteer Request Created",
        subtitle: "A project has been opened for participants",
      });
      toast.success("Reqest posted to Volunteers");
    },
    onError: (error: Error) => {
      toast.error("Failed to create project request", {
        description: error.message,
      });
    },
  });
}

export function useAddProjectHistory() {
  return useMutation({
    mutationKey: ["create-project-history"],
    mutationFn: createProjectHistory,
  });
}

export function useGetProjectDiscussionRoomId(params: { id: string }) {
  return useQuery({
    queryKey: ["project-discussion-room", params],
    queryFn: async () => {
      const room = await getProjectDiscussionRoom(params);
      return room ?? null;
    },
    enabled: !!params.id,
  });
}
