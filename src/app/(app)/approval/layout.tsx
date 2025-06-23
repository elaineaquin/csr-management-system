import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Approvals',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
