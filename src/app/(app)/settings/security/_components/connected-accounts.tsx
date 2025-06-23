'use client';

import Checked from '@/components/checked';
import { LoadingButton } from '@/components/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinkedAccounts } from '@/hooks/use-auth';
import { getFormattedDate } from '@/lib/utils';
import { CircleAlertIcon, MailIcon } from 'lucide-react';
import { FaGithub, FaChrome } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { linkSocial, unlinkAccount } from '@/lib/auth-client';

export function ConnectedAccounts() {
	// states
	const [open, setOpen] = useState(false);
	const [googlePending, setGooglePending] = useState(false);
	const [githubPending, setGithubPending] = useState(false);

	// hooks
	const { data: accounts, isLoading, refetch } = useLinkedAccounts();
	const searchParams = useSearchParams();
	const connectParam = searchParams.get('connect');
	const router = useRouter();

	useEffect(() => {
		if (connectParam) {
			setOpen(true);
			const timeout = setTimeout(() => {
				router.replace('/settings/security', { scroll: false });
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [connectParam, router]);

	const connectToGithub = async () => {
		setGithubPending(true);
		await linkSocial({
			provider: 'github',
			callbackURL: '/settings/security?connect=github',
			fetchOptions: {
				onSuccess: () => {
					refetch();
				},
			},
		});
		setGithubPending(false);
	};

	const connectToGoogle = async () => {
		setGooglePending(true);
		await linkSocial({
			provider: 'google',
			callbackURL: '/settings/security?connect=google',
			fetchOptions: {
				onSuccess: () => {
					refetch();
				},
			},
		});
		setGooglePending(false);
	};

	const disconnectSocials = (provider: string) => {
		unlinkAccount(
			{ providerId: provider },
			{
				onSuccess: () => {
					refetch();
				},
			},
		);
	};

	if (isLoading) {
		return <Skeleton className="w-full h-40" />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Connected Accounts</CardTitle>
				<CardDescription>Manage your connected social accounts for faster sign-in</CardDescription>
				<CardAction>
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button variant={'outline'} size={'sm'}>
								Connected Account
							</Button>
						</DialogTrigger>
						<DialogContent className="md:min-w-4xl">
							<DialogTitle>Connect Account</DialogTitle>
							<DialogDescription>
								Connect your accounts to enable easier sign-in and enhanced security.
							</DialogDescription>
							<Alert>
								<CircleAlertIcon className="w-4 h-4" />
								<AlertDescription>
									Connecting multiple accounts gives you alternative ways to sign in and also adds an extra layer of
									account recovery options.
								</AlertDescription>
							</Alert>
							<div className="space-y-4">
								{['github', 'google'].map((provider) => {
									const isConnected = accounts?.some((account) => account.provider === provider);
									const isPending = provider === 'github' ? githubPending : googlePending;
									const onClick = provider === 'github' ? connectToGithub : connectToGoogle;

									return (
										<Card key={provider}>
											<CardHeader>
												<CardTitle className="capitalize flex items-center gap-2">
													{provider}
													{isConnected && <Checked className="w-4 h-4" />}
												</CardTitle>
												<CardDescription>Connect your {provider} account</CardDescription>
												<CardAction>
													<LoadingButton
														pending={isPending}
														variant={'outline'}
														onClick={onClick}
														disabled={isConnected}
														className="capitalize"
													>
														{isConnected ? 'Already Connected' : `Connect ${provider}`}
													</LoadingButton>
												</CardAction>
											</CardHeader>
										</Card>
									);
								})}
							</div>
						</DialogContent>
					</Dialog>
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-4">
				{accounts ? (
					accounts.map((account) => (
						<div key={account.id} className="flex items-center space-x-3 border p-4 rounded-md justify-between">
							<div className="flex items-center space-x-3">
								{account.provider === 'github' && <FaGithub className="w-5 h-5" />}
								{account.provider === 'google' && <FaChrome className="w-5 h-5" />}
								{account.provider === 'credential' && <MailIcon className="w-5 h-5" />}
								<div>
									<h5 className="font-medium capitalize">{account.provider}</h5>
									<p className="text-sm text-muted-foreground">Connected on {getFormattedDate(account.createdAt)}</p>
								</div>
							</div>
							<Button
								variant={'destructive'}
								size={'sm'}
								disabled={account.provider === 'credential'}
								title={
									account.provider === 'credential'
										? 'Cannot disconnect primary credential login'
										: 'Disconnect this account'
								}
								onClick={() => disconnectSocials(account.provider)}
							>
								Disconnect
							</Button>
						</div>
					))
				) : (
					<p className="text-muted-foreground text-sm">No accounts connected yet.</p>
				)}
			</CardContent>
		</Card>
	);
}
