'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAcceptInviteLink } from '@/hooks/use-document';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SectionWrapper } from '@/components/section-wrapper';

export default function Page() {
	const params = useParams();
	const inviteToken = params?.token as string;
	const router = useRouter();

	const { data, isLoading, isError } = useAcceptInviteLink({ token: inviteToken });

	useEffect(() => {
		if (data?.folderId) {
			// Delay a little for UX (optional)
			const timeout = setTimeout(() => {
				router.push(`/document/${data.folderId}`);
			}, 1000);
			return () => clearTimeout(timeout);
		}
	}, [data, router]);

	if (isLoading) {
		return <Skeleton className="h-24 w-full" />;
	}

	if (isError || !data) {
		return (
			<SectionWrapper>
				<Alert variant="destructive">
					<AlertTitle>Invalid or expired invite link</AlertTitle>
					<AlertDescription>Please check the link or contact the folder owner.</AlertDescription>
				</Alert>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper>
			<div className="space-y-4">
				<h1 className="text-2xl font-bold">Access granted!</h1>
				<p className="text-muted-foreground">Redirecting to the folder...</p>
			</div>
		</SectionWrapper>
	);
}
