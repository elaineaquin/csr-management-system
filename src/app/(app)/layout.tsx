import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { cookies } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar variant="sidebar" collapsible="icon" className="border-grid border-r" />
			<SidebarInset>
				<AppHeader />
				<main>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
