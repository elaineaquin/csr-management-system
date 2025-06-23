import { Metadata } from 'next';
import React from 'react';
import getQueryClient from '@/lib/query-client';
import { dehydrate } from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';
import { getFinancialOverview, getFundRequests } from '@/server/fund-request';
import { getProjects } from '@/server/project';

export const metadata: Metadata = {
	title: 'Fund Requests',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient();

	// Prefetch the fund requests
	await queryClient.prefetchQuery({
		queryKey: ['fund-requests', { recent: true }],
		queryFn: async () => await getFundRequests({ title: '', recent: true }),
	});

	await queryClient.prefetchQuery({
		queryKey: ['financial-overview'],
		queryFn: async () => await getFinancialOverview(),
	});

	await queryClient.prefetchQuery({
		queryKey: ['project-list', { title: '' }],
		queryFn: () => getProjects({ title: '' }),
	});

	const dehydratedState = dehydrate(queryClient);

	return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}
