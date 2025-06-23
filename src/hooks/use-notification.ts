import { useMutation, useQuery } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket-client';
import { RoleKey } from '@/lib/permissions';
import {
	broadcastNotification,
	deleteNotification,
	getMyNotification,
	markNotificationAsRead,
	saveNotification,
} from '@/server/notification';

export function useGetAllNotifications() {
	return useQuery({
		queryKey: ['notifications'],
		queryFn: async () => {
			const notifications = await getMyNotification();
			return notifications ?? [];
		},
	});
}

export function useSendNotification() {
	return useMutation({
		mutationKey: ['send-notification'],
		mutationFn: saveNotification,
		onSuccess: (data: { message: string; userId: string }) => {
			const socket = getSocket();
			if (!socket) {
				console.error('No socket found');
				return;
			}
			socket.emit('notify-user', {
				userId: data.userId,
				message: data.message,
			});
		},
	});
}

export function useSendBroadcastNotification() {
	return useMutation({
		mutationKey: ['send-broadcast-notification'],
		mutationFn: async (params: { roles: RoleKey[]; link: string; message: string }) => {
			await broadcastNotification({
				roles: params.roles,
				data: {
					link: params.link,
					message: params.message,
				},
			});
			return {
				roles: params.roles,
				message: params.message,
			};
		},
		onSuccess: (data: { roles: RoleKey[]; message: string }) => {
			const socket = getSocket();
			if (!socket) {
				console.error('No socket found');
				return;
			}
			data.roles.forEach((role) => {
				socket.emit('broadcast', {
					role: role,
					message: data.message,
				});
			});
		},
	});
}

export function useMarkNotificationAsRead() {
	return useMutation({
		mutationKey: ['mark-notification-as-read'],
		mutationFn: async (params: { notificationId: string }) => {
			return await markNotificationAsRead(params);
		},
	});
}

export function useDeleteNotification() {
	return useMutation({
		mutationKey: ['delete-notification'],
		mutationFn: async (params: { notificationId: string }) => {
			return await deleteNotification(params);
		},
	});
}
