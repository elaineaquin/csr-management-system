import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: 'Dashboard',
};

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
