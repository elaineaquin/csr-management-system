import { signOut, useSession } from '@/lib/auth-client';
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { Skeleton } from './ui/skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOutIcon, Settings2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingButton } from './loading-button';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function AppFooter() {
	// states
	const [logoutPending, setLogoutPending] = useState(false);

	// hooks
	const { data: session, isPending } = useSession();
	const queryClient = useQueryClient();
	const { isMobile } = useSidebar();
	const router = useRouter();

	const handleSignout = async () => {
		setLogoutPending(true);
		try {
			await signOut();
			queryClient.clear();
			router.push('/login');
		} finally {
			setLogoutPending(false);
		}
	};

	if (isPending || !session?.user) {
		return (
			<SidebarFooter>
				<SidebarMenuItem>
					<Skeleton className="w-full h-10 " />
				</SidebarMenuItem>
			</SidebarFooter>
		);
	}

	return (
		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={session.user.image as string} />
									<AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{session.user.name}</span>
									<span className="truncate text-xs">{session.user.email}</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={isMobile ? 'bottom' : 'right'}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={session.user.image as string} />
										<AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{session.user.name}</span>
										<span className="truncate text-xs">{session.user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>{' '}
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => router.push('/settings')}>
									<Settings2Icon />
									Settings
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild variant="destructive">
								<LoadingButton
									pending={logoutPending}
									onClick={handleSignout}
									variant="ghost"
									className="flex justify-start text-sm "
								>
									<LogOutIcon className="w-4 h-4" />
									<span>Sign out</span>
								</LoadingButton>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	);
}
