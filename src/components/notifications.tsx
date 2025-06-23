'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { BellIcon, XIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notification } from '@prisma/client';
import { useMarkNotificationAsRead, useDeleteNotification, useGetAllNotifications } from '@/hooks/use-notification';
import { useEffect, useState } from 'react';
import { getSocket, initiateSocket } from '@/lib/socket-client';

export function Notifications({ ...props }: React.ComponentProps<typeof Button>) {
	const [unreadCount, setUnreadCount] = useState(0);

	const { data: notifications = [], refetch, isLoading } = useGetAllNotifications();
	const { mutateAsync: markNotificationAsRead } = useMarkNotificationAsRead();
	const { mutateAsync: deleteNotification } = useDeleteNotification();
	const router = useRouter();

	useEffect(() => {
		initiateSocket(process.env.BETTER_AUTH_URL);
		const socket = getSocket();
		if (!socket) return;

		const handleNotification = () => {
			refetch();
		};

		socket.on('notification', handleNotification);
		return () => {
			socket.off('notification', handleNotification);
		};
	}, [refetch]);

	useEffect(() => {
		if (!isLoading) {
			setUnreadCount(notifications.filter((notification) => !notification.read).length);
		}
	}, [notifications, isLoading]);

	const handleNotificationOnClick = async (notification: Notification) => {
		await markNotificationAsRead({ notificationId: notification.id });
		await refetch();
		if (notification.link) {
			router.push(notification.link);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button {...props}>
					<BellIcon className="w-4 h-4" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
							{unreadCount}
						</span>
					)}
					<span className="sr-only">Notifications</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[350px] max-h-[500px]">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>({unreadCount} unread) Notifications</span>
					{unreadCount > 0 && (
						<Button
							size={'sm'}
							variant={'ghost'}
							className="text-xs"
							onClick={async () => {
								await Promise.all(
									notifications
										.filter((notification) => !notification.read)
										.map((notification) => markNotificationAsRead({ notificationId: notification.id })),
								);
								await refetch();
							}}
						>
							Mark all as Read
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{notifications.length > 0 ? (
					<div className="space-y-1">
						{notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								className={cn(notification.read ? '' : 'bg-primary/5', 'cursor-pointer flex')}
								onClick={() => handleNotificationOnClick(notification)}
							>
								<div>
									<p>{notification.message}</p>
									<span className="text-xs text-muted-foreground">
										{formatDistanceToNow(notification.createdAt, {
											addSuffix: true,
										})}
									</span>
								</div>
								<Button
									variant={'ghost'}
									size={'icon'}
									className="ml-auto z-50"
									onClick={async (e) => {
										e.stopPropagation(); // 🛡️ Prevent triggering parent
										await deleteNotification({ notificationId: notification.id });
										refetch();
									}}
								>
									<XIcon className="h-3 w-3" />
									<span className="sr-only">Remove</span>
								</Button>
							</DropdownMenuItem>
						))}
					</div>
				) : (
					<div className="p-2 text-xs text-center">No Notifications</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
