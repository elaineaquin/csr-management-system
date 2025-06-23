'use client';

import { ReactNode, useEffect } from 'react';
import { useHasPermission } from '@/hooks/use-permissions';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PermissionGroup, PermissionActions } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

interface AccessGuardProps<Key extends PermissionGroup> {
	page: Key;
	actions?: PermissionActions[Key][];
	children: ReactNode;
}

export const AccessGuard = <Key extends PermissionGroup>({ page, actions, children }: AccessGuardProps<Key>) => {
	const router = useRouter();
	const { data: hasAccess, isLoading } = useHasPermission({
		[page]: ['view', ...(actions || [])],
	});

	useEffect(() => {
		if (hasAccess?.success === false) {
			router.replace('/unauthorized');
		}
	}, [hasAccess, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Card className="p-6 flex flex-col items-center space-y-4 shadow-md">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Checking access permissions...</p>
				</Card>
			</div>
		);
	}
	return <>{children}</>;
};
