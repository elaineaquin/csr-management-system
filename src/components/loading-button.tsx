import React from 'react';
import { Button, buttonVariants } from './ui/button';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

export function LoadingButton({
	className,
	children,
	pending,
	variant,
	...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { pending: boolean }) {
	return (
		<Button className={cn(className, 'w-full capitalize')} disabled={pending} variant={variant} {...props}>
			{pending ? (
				<>
					<LoaderCircle className="animate-spin h-5 w-5 mr-2" />
					<span className="sr-only">Loading</span>
				</>
			) : (
				children
			)}
		</Button>
	);
}
