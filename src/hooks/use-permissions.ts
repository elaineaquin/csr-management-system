import { admin } from '@/lib/auth-client';
import { PermissionRequest } from '@/lib/permissions';
import { canAccessKanban } from '@/server/project';
import { useQuery } from '@tanstack/react-query';

export function useHasPermission(permissions: PermissionRequest) {
	return useQuery({
		queryKey: ['has-permission', permissions],
		queryFn: async () => {
			const canAccessPage = await admin.hasPermission({ permissions });
			return canAccessPage.data;
		},
	});
}

export function useCanAccessKanbanBoard(params: { projectId: string }) {
	return useQuery({
		queryKey: ['is-member', params],
		queryFn: async () => {
			const canAccessPage = await canAccessKanban(params);
			return canAccessPage ?? false;
		},
		enabled: !!params.projectId,
	});
}
