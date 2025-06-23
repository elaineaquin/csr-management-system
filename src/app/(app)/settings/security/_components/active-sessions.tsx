'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useActiveSessions } from '@/hooks/use-auth';
import { revokeSession, revokeSessions, signOut } from '@/lib/auth-client';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	CardAction,
} from '@/components/ui/card';
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { parseUserAgent, getFormattedDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function ActiveSessions() {
	// hooks
	const { data: activeSessions, isLoading, refetch } = useActiveSessions();
	const queryClient = useQueryClient();
	const router = useRouter();

	const onRevokeSession = async (token: string) => {
		try {
			await revokeSession(
				{ token },
				{
					onSuccess: () => {
						refetch();
					},
				},
			);
		} catch (err) {
			toast.error('Something went wrong', {
				description: `${err}`,
			});
		}
	};

	const onRevokeAllSessions = async () => {
		try {
			await revokeSessions();
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ['session'] });
						router.push('/sign-in');
					},
				},
			});
		} catch (err) {
			toast.error('Something went wrong', {
				description: `${err}`,
			});
		}
	};

	if (isLoading) {
		return <Skeleton className="w-full h-40" />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Active Sessions</CardTitle>
				<CardDescription>Manage your active sessions and devices.</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableCaption>List of currently active sessions</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[250px]">Device</TableHead>
							<TableHead>IP Address</TableHead>
							<TableHead>Signed In</TableHead>
							<TableHead>Expires At</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{activeSessions?.map((session) => {
							const isCurrent = session.id === session?.id;
							return (
								<TableRow key={session.id}>
									<TableCell className="font-medium flex flex-col">
										{parseUserAgent(session.userAgent)}
										{isCurrent && (
											<Badge variant={'outline'} className="w-fit text-xs">
												Current Session
											</Badge>
										)}
									</TableCell>
									<TableCell>{session.ipAddress || 'N/A'}</TableCell>
									<TableCell>{getFormattedDate(session.createdAt)}</TableCell>
									<TableCell>{getFormattedDate(session.expiresAt)}</TableCell>
									<TableCell className="text-right">
										<Button disabled={isCurrent} variant={'outline'} onClick={() => onRevokeSession(session.token)}>
											Sign out
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter className="flex flex-col items-start space-y-2">
				<CardAction>
					<Button variant={'outline'} size={'sm'} onClick={onRevokeAllSessions}>
						Revoke all session
					</Button>
				</CardAction>
				<p className="text-sm text-muted-foreground">
					This will revoke all other sessions and sign you out from all devices.
				</p>
			</CardFooter>
		</Card>
	);
}
