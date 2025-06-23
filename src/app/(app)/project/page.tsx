import { AccessGuard } from '@/components/access-guard';
import { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChartIcon, CheckCircle2Icon, CirclePlusIcon, ClockIcon, FlagIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { ButtonGuard } from '@/components/button-guard';

export default function ProjectPage() {
	return (
		<AccessGuard page="proposal">
			<PageHeader>
				<div>
					<PageHeaderHeading>Project Proposals</PageHeaderHeading>
					<PageHeaderDescription>Manage and track your CSR project proposals</PageHeaderDescription>
				</div>
				<PageActions>
					<ButtonGuard name="proposal" actions={['create']}>
						<Button asChild>
							<Link href="/project/new">
								<CirclePlusIcon className="w-4 h-4 mr-2" />
								Create new Project Proposal
							</Link>
						</Button>
					</ButtonGuard>
				</PageActions>
			</PageHeader>

			<Tabs defaultValue="all" className="gap-0">
				<SectionWrapper>
					<TabsList>
						<TabsTrigger value="all">
							<BarChartIcon className="h-4 w-4 mr-2" />
							All Proposals
						</TabsTrigger>
						<TabsTrigger value="my">
							<UserIcon className="h-4 w-4 mr-2" />
							My Proposals
						</TabsTrigger>
						<TabsTrigger value="pending">
							<ClockIcon className="h-4 w-4 mr-2" />
							Pending Review
						</TabsTrigger>
						<TabsTrigger value="approved">
							<CheckCircle2Icon className="h-4 w-4 mr-2" />
							Approved
						</TabsTrigger>
						<TabsTrigger value="completed">
							<FlagIcon className="h-4 w-4 mr-2" />
							Completed
						</TabsTrigger>
					</TabsList>
				</SectionWrapper>
				<SectionWrapper>
					<TabsContent value="all">
						<DataTable columns={columns} />
					</TabsContent>
					<TabsContent value="my">
						<DataTable columns={columns} userOnly={true} />
					</TabsContent>
					<TabsContent value="pending">
						<DataTable columns={columns} statusFilter="Pending" />
					</TabsContent>
					<TabsContent value="approved">
						<DataTable columns={columns} statusFilter="Approved" />
					</TabsContent>
					<TabsContent value="completed">
						<DataTable columns={columns} statusFilter="Completed" />
					</TabsContent>
				</SectionWrapper>
			</Tabs>
		</AccessGuard>
	);
}
