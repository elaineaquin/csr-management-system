'use client';

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { useGetParticipationRequests } from '@/hooks/use-volunteer';
import { Card, CardContent } from '@/components/ui/card';
import { PostRequest } from './post-request';
import { AccessGuard } from '@/components/access-guard';

export default function Page() {
	const { data } = useGetParticipationRequests();

	return (
		<AccessGuard page="volunteer">
			<PageHeader>
				<div>
					<PageHeaderHeading>Volunteer Opportunities</PageHeaderHeading>
					<PageHeaderDescription>
						Browse open participation requests from projects seeking volunteers
					</PageHeaderDescription>
				</div>
			</PageHeader>
			<SectionWrapper className="space-y-6">
				{data && data.length > 0 ? (
					data.map((request) => <PostRequest key={request.id} request={request} />)
				) : (
					<Card>
						<CardContent className="py-10 text-center">
							<p className="text-muted-foreground">No participation requests found</p>
						</CardContent>
					</Card>
				)}
			</SectionWrapper>
		</AccessGuard>
	);
}
