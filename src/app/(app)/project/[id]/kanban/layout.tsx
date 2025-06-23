import getQueryClient from '@/lib/query-client';
import { getProjects } from '@/server/project';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Kanban',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ['project-list', { title: '' }],
		queryFn: () => getProjects({ title: '' }),
	});

	const dehydratedState = dehydrate(queryClient);
	return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}
