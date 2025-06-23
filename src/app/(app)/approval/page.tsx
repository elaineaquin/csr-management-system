import { AccessGuard } from '@/components/access-guard';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSignIcon, FileTextIcon } from 'lucide-react';
import { PendingProjects } from './_components/pending-projects';
import { PendingFundRequests } from './_components/pending-fund-requests';

export default function ReportPage() {
	return (
		<AccessGuard page="approvalAndComs">
			<PageHeader>
				<div>
					<PageHeaderHeading>Approval & Communications</PageHeaderHeading>
					<PageHeaderDescription>Manage the approval process</PageHeaderDescription>
				</div>
			</PageHeader>
			<Tabs defaultValue="project" className="gap-0">
				<SectionWrapper>
					<TabsList>
						<TabsTrigger value="project">
							<FileTextIcon />
							Pending Projects
						</TabsTrigger>
						<TabsTrigger value="fundRequest">
							<DollarSignIcon />
							Pending Fund Requests
						</TabsTrigger>
					</TabsList>
				</SectionWrapper>
				<SectionWrapper>
					<TabsContent value="project">
						<PendingProjects />
					</TabsContent>
					<TabsContent value="fundRequest">
						<PendingFundRequests />
					</TabsContent>
				</SectionWrapper>
			</Tabs>
		</AccessGuard>
	);
}
