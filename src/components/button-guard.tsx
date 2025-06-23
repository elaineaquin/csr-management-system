'use client';

import { useHasPermission } from '@/hooks/use-permissions';
import { ReactNode } from 'react';
import { PermissionGroup, PermissionActions } from '@/lib/permissions';

interface ButtonGuardProps<Key extends PermissionGroup> {
	children: ReactNode;
	name: Key;
	actions: PermissionActions[Key][];
	isOwner?: boolean;
}

export const ButtonGuard = <Key extends PermissionGroup>({
	children,
	name,
	actions,
	isOwner,
}: ButtonGuardProps<Key>) => {
	const { data: hasAccess, isLoading } = useHasPermission({ [name]: actions });
	const allowed = isOwner || (hasAccess && hasAccess.success);

	if (isLoading || !allowed) return null;
	return <>{children}</>;
};
