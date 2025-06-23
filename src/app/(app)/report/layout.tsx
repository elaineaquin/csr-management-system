import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Monitoring & Reporting',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
