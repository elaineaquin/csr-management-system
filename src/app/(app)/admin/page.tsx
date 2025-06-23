'use client';

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User } from 'lucide-react';
import { UserManagement } from './_components/user-management';
import { AccessGuard } from '@/components/access-guard';

export default function AdminPage() {
	return (
		<AccessGuard page="adminPanel">
			<PageHeader>
				<div className="flex flex-col items-start gap-2">
					<PageHeaderHeading>Admin Panel</PageHeaderHeading>
					<PageHeaderDescription>Manage your application settings and users</PageHeaderDescription>
				</div>
			</PageHeader>

			<Tabs defaultValue="users" className="gap-0">
				<SectionWrapper>
					<TabsList>
						<TabsTrigger value="users">
							<User className="size-4" />
							Users
						</TabsTrigger>
					</TabsList>
				</SectionWrapper>
				<SectionWrapper>
					<TabsContent value="users">
						<UserManagement />
					</TabsContent>
				</SectionWrapper>
			</Tabs>
		</AccessGuard>
	);
}
