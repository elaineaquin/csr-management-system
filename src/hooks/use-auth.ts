'use client';

import { useQuery } from '@tanstack/react-query';
import { admin, listAccounts, listSessions } from '@/lib/auth-client';
import { getUserById } from '@/server/user';

// get user by id, don't cache
export function useGetUserById(params: { userId: string }) {
	return useQuery({
		queryKey: ['get-user-by-id', params],
		queryFn: async () => {
			const user = await getUserById(params);
			return user ?? null;
		},
		enabled: !!params.userId,
		gcTime: 0,
		staleTime: 0,
	});
}
// get users list, don't cache
export function useGetUsersList(params: { limit: number; offset: number; searchValue: string }) {
	return useQuery({
		queryKey: ['get-users-list', params],
		queryFn: async () => {
			const response = await admin.listUsers({
				query: {
					limit: params.limit,
					offset: params.offset,
					searchValue: params.searchValue,
					searchField: 'name',
					searchOperator: 'contains',
				},
			});
			return response.data;
		},
		gcTime: 0,
		staleTime: 0,
	});
}

export function useLinkedAccounts() {
	return useQuery({
		queryKey: ['list-accounts'],
		queryFn: async () => {
			const response = await listAccounts();
			return response.data;
		},
		gcTime: 0,
		staleTime: 0,
	});
}

export function useActiveSessions() {
	return useQuery({
		queryKey: ['list-sessions'],
		queryFn: async () => {
			const response = await listSessions();
			return response.data;
		},
	});
}
