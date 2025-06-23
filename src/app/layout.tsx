import type { Metadata } from 'next';
import './globals.css';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { siteConfig } from '@/config/site';
import { TanstackProvider } from '@/components/providers/tanstack-provider';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	icons: {
		icon: '/csrms-logo.png',
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({ headers: await headers() });
	const theme = session?.user.theme ?? 'system';

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange>
					<TanstackProvider>
						<NextTopLoader showSpinner={false} />
						{children}
					</TanstackProvider>
					<Toaster richColors closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}
