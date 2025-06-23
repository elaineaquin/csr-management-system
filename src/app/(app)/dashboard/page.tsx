'use client';

import { AccessGuard } from '@/components/access-guard';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { useSession } from '@/lib/auth-client';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Overview } from './overview';

export default function DashboardPage() {
	const { data, isPending } = useSession();
	const { setTheme } = useTheme();

	useEffect(() => {
		if (!isPending && data?.user) {
			setTheme(data.user.theme ?? 'system');
		}
	}, [isPending, data, setTheme]);

	return (
		<AccessGuard page="dashboard">
			<PageHeader>
				<div>
					<PageHeaderHeading>Dashboard</PageHeaderHeading>
					<PageHeaderDescription>
						Get a quick overview of key metrics, recent activity, and project performance at a glance.
					</PageHeaderDescription>
				</div>
			</PageHeader>
			<SectionWrapper>
				<Overview />
			</SectionWrapper>
		</AccessGuard>
	);
}
