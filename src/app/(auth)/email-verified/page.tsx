'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Checked from '@/components/checked';

export default function Page() {
	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex w-full justify-between items-center">
					<CardTitle>Email Verified</CardTitle>
					<Checked />
				</div>
				<CardDescription>Your email has been successfully verified.</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant={'default'} asChild>
					<Link href={'/dashboard'}>Go to Home</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
