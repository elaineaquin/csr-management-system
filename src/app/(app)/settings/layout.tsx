import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Metadata } from 'next';
import React from 'react';
import { SettingsNav } from './_components/settings-nav';
import { SectionWrapper } from '@/components/section-wrapper';

export const metadata: Metadata = {
	title: 'Project',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<PageHeader>
				<div>
					<PageHeaderHeading>Settings</PageHeaderHeading>
					<PageHeaderDescription>Manage your account settings and preferences</PageHeaderDescription>
				</div>
			</PageHeader>
			<SettingsNav />
			<SectionWrapper className="space-y-4">{children}</SectionWrapper>
		</>
	);
}
