import getQueryClient from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Document Repository',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient();

	const dehydratedState = dehydrate(queryClient);
	return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}
