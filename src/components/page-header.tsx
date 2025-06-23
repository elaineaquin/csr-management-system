import { cn } from '@/lib/utils';

function PageHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<section className={cn('border-grid border-b', className)} {...props}>
			<div className="container-wrapper">
				<div className="container flex flex-row items-center justify-between py-6 w-full">{children}</div>
			</div>
		</section>
	);
}

function PageHeaderHeading({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h1 className={cn('text-2xl font-bold leading-tight tracking-tighter lg:leading-[1.1]', className)} {...props} />
	);
}

function PageHeaderDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('text-balance text-base font-light text-muted-foreground', className)} {...props} />;
}

function PageActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex items-center justify-start gap-2 pt-2', className)} {...props} />;
}

export { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading };
