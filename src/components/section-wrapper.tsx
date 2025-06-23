import { cn } from '@/lib/utils';
import React from 'react';

export function SectionWrapper({ children, className }: Readonly<{ children?: React.ReactNode; className?: string }>) {
	return (
		<section className="border-grid border-b">
			<div className="container-wrapper">
				<div className={cn('container py-4', className)}>{children}</div>
			</div>
		</section>
	);
}
