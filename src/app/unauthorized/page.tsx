import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Unauthorized',
};

export default function Page() {
	return (
		<div className="flex items-center justify-center px-4 h-[700px]">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-200/20">
						<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">401 - Unauthorized</CardTitle>
					<CardDescription className="text-gray-600 dark:text-gray-400">
						You don&apos;t have permission to access this page
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-center text-sm text-gray-500 dark:text-gray-400">
						Please contact your administrator to continue accessing this resource.
					</p>
					<div className="flex flex-col gap-3">
						<Button variant="outline" asChild className="w-full">
							<Link href="/dashboard">
								<Home className="mr-2 h-4 w-4" />
								Return Home
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
