'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="max-w-md mx-auto text-center px-4">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
					<h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
					<p className="text-muted-foreground mb-8">
						Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you
						entered the wrong URL.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild>
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Go Home
						</Link>
					</Button>

					<Button variant="outline" onClick={() => window.history.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
				</div>
			</div>
		</div>
	);
}
