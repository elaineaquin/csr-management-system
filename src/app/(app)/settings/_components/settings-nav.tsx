'use client';

import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboardIcon, UserIcon, ShieldIcon } from 'lucide-react';

const settingsNavItems = [
	{ label: 'Overview', link: '/settings', icon: LayoutDashboardIcon },
	{ label: 'Account', link: '/settings/account', icon: UserIcon },
	{ label: 'Security', link: '/settings/security', icon: ShieldIcon },
];
export function SettingsNav() {
	const pathname = usePathname();
	const isActive = (path: string) => pathname === path || pathname?.startsWith(`/settings/${path}`);

	return (
		<SectionWrapper className="space-x-2">
			{settingsNavItems.map((item) => (
				<Button key={item.label} asChild variant={isActive(item.link) ? 'default' : 'secondary'} size={'sm'}>
					<Link href={item.link}>
						<item.icon />
						{item.label}
					</Link>
				</Button>
			))}
		</SectionWrapper>
	);
}
