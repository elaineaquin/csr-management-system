"use client";

import {
  closeVolunteerRequest,
  getAllRequest,
  getUserParticipatedProjects,
  getUserTasks,
  getVolunteerRequestById,
  getVolunteersByProjectId,
  participateRequest,
  updateUserAvailability,
  updateVolunteerRequest,
  updateVolunteerStatus,
} from "@/server/volunteer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSendNotification } from "./use-notification";

export function useUpdateVolunteerRequest() {
  return useMutation({
    mutationKey: ["updated-volunteer-request"],
    mutationFn: updateVolunteerRequest,
    onSuccess: () => {
      toast.success("Request updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update project request", {
        description: error.message,
      });
    },
  });
}

export function useGetParticipationRequests() {
  return useQuery({
    queryKey: ["participation-requests"],
    queryFn: async () => {
      const result = await getAllRequest();
      return result ?? [];
    },
  });
}

export function useParticipateRequest() {
  const queryClient = useQueryClient();
  const { mutateAsync: sendNotification } = useSendNotification();

  return useMutation({
    mutationKey: ["participate-request"],
    mutationFn: participateRequest,
    onSuccess: (data) => {
      toast.success("Successfully applied to the request.");
      queryClient.invalidateQueries({ queryKey: ["participation-requests"] });

      sendNotification({
        user: {
          connect: { id: data.createdById },
        },
        message: `${data.name} has requested to participate on your project "${data.title}"`,
        link: `/project/participate/${data.requestId}`,
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });
}

export function useGetParicipantsByProjectId(params: { projectId: string }) {
  return useQuery({
    queryKey: ["get-participants", params],
    queryFn: async () => {
      const participants = await getVolunteersByProjectId(params);
      return participants ?? [];
    },
    enabled: !!params.projectId,
  });
}

export function useGetProjectRequestById(params: { id: string }) {
  return useQuery({
    queryKey: ["get-request", params],
    queryFn: async () => {
      const request = await getVolunteerRequestById(params);
      return request ?? null;
    },
    enabled: !!params.id,
  });
}

export function useCloseVolunteerRequest() {
  return useMutation({
    mutationKey: ["close-request"],
    mutationFn: closeVolunteerRequest,
    onSuccess: () => {
      toast.success("Request closed");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });
}

export function useUpdateVolunterAvailability() {
  return useMutation({
    mutationKey: ["update-availability"],
    mutationFn: updateUserAvailability,
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });
}

export function useGetParticipatedProjects() {
  return useQuery({
    queryKey: ["volunteer-projects"],
    queryFn: async () => {
      const projects = await getUserParticipatedProjects();
      return projects ?? [];
    },
  });
}

export function useGetVolunteerTasks() {
  return useQuery({
    queryKey: ["volunteer-tasks"],
    queryFn: async () => {
      const tasks = await getUserTasks();
      return tasks ?? [];
    },
  });
}

export function useApproveVolunteer() {
  const { mutateAsync: sendNotification } = useSendNotification();
  return useMutation({
    mutationFn: async (volunteerId: string) => {
      return await updateVolunteerStatus({ volunteerId, status: "Approved" });
    },
    onSuccess: (data) => {
      sendNotification({
        user: {
          connect: { id: data.userId },
        },
        message: `Your request to volunteer for "${data.title}" has been approved.`,
        link: `/project/participate/${data.requestId}`,
      });
      if (data.requestStatus === "Filled") {
        sendNotification({
          user: {
            connect: { id: data.createdById },
          },
          message: `Your project "${data.title}" has reached the maximum number of volunteers.`,
          link: `/project/participate/${data.requestId}`,
        });
      }
    },
  });
}

export function useRejectVolunteer() {
  const { mutateAsync: sendNotification } = useSendNotification();
  return useMutation({
    mutationFn: async (volunteerId: string) => {
      return await updateVolunteerStatus({ volunteerId, status: "Rejected" });
    },
    onSuccess: (data) => {
      sendNotification({
        user: {
          connect: { id: data.userId },
        },
        message: `Your request to volunteer for "${data.title}" has been rejected.`,
        link: `/project/participate/${data.requestId}`,
      });
    },
  });
}
