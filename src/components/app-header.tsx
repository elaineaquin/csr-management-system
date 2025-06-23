'use client';

import { useSession } from '@/lib/auth-client';
import { SidebarTrigger } from './ui/sidebar';
import { useEffect } from 'react';
import { initiateSocket, joinRoleRoom, joinUserRoom } from '@/lib/socket-client';
import { Notifications } from './notifications';

export function AppHeader() {
	const { data: session } = useSession();

	useEffect(() => {
		initiateSocket(process.env.BETTER_AUTH_URL);
	}, []);

	useEffect(() => {
		if (session?.user) {
			const roles = session.user.role?.split(',').map((r) => r.trim());
			roles?.forEach((role) => joinRoleRoom(role));
			joinUserRoom(session.user.id);
		}
	}, [session]);

	return (
		<header className="border-grid  border-b shrink-0 sticky top-0 z-50 transition-all bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container-wrapper">
				<div className="container h-14 flex items-center">
					<SidebarTrigger />
					<Notifications variant="ghost" size="icon" className="relative size-8 ml-auto" />
				</div>
			</div>
		</header>
	);
}
