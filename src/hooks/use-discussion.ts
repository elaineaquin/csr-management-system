'use client';

import { getSocket } from '@/lib/socket-client';
import { getDiscussionMessages, sendMessage } from '@/server/discussions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useGetDiscussionMessages(params: { roomId: string }) {
	return useQuery({
		queryKey: ['get-discussion-messages', params],
		queryFn: async () => {
			const messages = await getDiscussionMessages(params);
			return messages ?? [];
		},
		enabled: !!params.roomId,
		gcTime: 0,
		staleTime: 0,
	});
}

export function useSendMessage() {
	return useMutation({
		mutationFn: sendMessage,
		onSuccess: (data) => {
			console.log(data);
			const socket = getSocket();
			if (socket) {
				socket.emit('message', data);
			}
		},
		onError: (error) => {
			toast.error('Message not sent', {
				description: JSON.stringify(error, null, 2),
			});
		},
	});
}
