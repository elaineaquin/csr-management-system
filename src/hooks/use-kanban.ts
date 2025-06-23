'use client';

import {
	addKanbanColumn,
	addTaskCard,
	deleteColumn,
	deleteTask,
	getKanbanBoard,
	getKanbanFormRequirements,
	renameColumn,
	updateColumnColor,
	updateColumnPosition,
	updateTaskCardPosition,
} from '@/server/kanban';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendNotification } from './use-notification';

export function useGetKanbanBoard(params: { projectId: string }) {
	return useQuery({
		queryKey: ['get-kanban-board', params],
		queryFn: async () => {
			const board = await getKanbanBoard(params);
			return board ?? null;
		},
		enabled: !!params.projectId,
	});
}

export function useGetKanbanFormRequirements(params: { projectId: string }) {
	return useQuery({
		queryKey: ['get-kanban-board-form-requirements', params],
		queryFn: async () => {
			const board = await getKanbanFormRequirements(params);
			return board ?? null;
		},
		enabled: !!params.projectId,
	});
}

export function useAddKanbanColumn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: addKanbanColumn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-kanban-board-form-requirements'],
				exact: false, // allow params to vary
			});
		},
	});
}

export function useAddKanbanCardTask() {
	const { mutateAsync: sendNotificationAsync } = useSendNotification();
	return useMutation({
		mutationKey: ['add-kanban-card-task'],
		mutationFn: addTaskCard,
		onSuccess: async (data) => {
			if (!data?.assignees?.length) return;

			await Promise.all(
				data.assignees.map((assignee) =>
					sendNotificationAsync({
						user: {
							connect: {
								id: assignee.userId,
							},
						},
						link: `/project/${data.projectId}/kanban`,
						message: `You've been assigned a new task: "${data.title}"`,
					}),
				),
			);
		},
	});
}

export function useUpdateKanbanCardTask() {
	return useMutation({
		mutationKey: ['update-kanban-card-task'],
		mutationFn: updateTaskCardPosition,
	});
}

export function useUpdateKanbanColumn() {
	return useMutation({
		mutationKey: ['update-kanban-column'],
		mutationFn: updateColumnPosition,
	});
}

export function useUpdateColumnColor() {
	return useMutation({
		mutationFn: updateColumnColor,
	});
}

export function useDeleteColumn() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteColumn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-kanban-board-form-requirements'],
				exact: false, // allow params to vary
			});
		},
	});
}

export function useRenameColumn() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: renameColumn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-kanban-board-form-requirements'],
				exact: false, // allow params to vary
			});
		},
	});
}

export function useDeleteTask() {
	return useMutation({
		mutationFn: deleteTask,
	});
}
