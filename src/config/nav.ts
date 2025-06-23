import { PermissionGroup } from '@/lib/permissions';
import {
	AudioLinesIcon,
	// CheckSquare2Icon,
	DollarSignIcon,
	FileTextIcon,
	FolderOpenIcon,
	LayoutDashboardIcon,
	LineChartIcon,
	// MessageSquareIcon,
	// RssIcon,
	User2Icon,
	Users2Icon,
} from 'lucide-react';

export type NavItem = {
	label: string;
	link?: string;
	icon: React.ElementType;
	permissions: PermissionGroup;
	children?: NavItem[];
};

export const navItems: NavItem[] = [
	{ label: 'Dashboard', link: '/dashboard', icon: LayoutDashboardIcon, permissions: 'dashboard' },
	// { label: 'Discussion', link: '/messages', icon: MessageSquareIcon, permissions: 'dashboard' },
	{ label: 'Project Proposals', link: '/project', icon: FileTextIcon, permissions: 'proposal' },
	{ label: 'Document Repository', link: '/document', icon: FolderOpenIcon, permissions: 'document' },
	{ label: 'Financial Disbursement', link: '/finance', icon: DollarSignIcon, permissions: 'fundRequest' },
	{ label: 'Monitoring & Reporting', link: '/report', icon: LineChartIcon, permissions: 'report' },
	{
		label: 'Approval & Communications',
		icon: AudioLinesIcon,
		permissions: 'approvalAndComs',
		link: '/approval',
		// children: [
		// 	{
		// 		label: 'Approvals',
		// 		link: '/approval',
		// 		icon: CheckSquare2Icon,
		// 		permissions: 'approvalAndComs',
		// 	},
		// 	{
		// 		label: 'Announcements',
		// 		link: '/announcement',
		// 		icon: RssIcon,
		// 		permissions: 'approvalAndComs',
		// 	},
		// ],
	},
	{
		label: 'Volunteer',
		icon: Users2Icon,
		permissions: 'volunteer',
		children: [
			{
				label: 'Volunteer Dashboard',
				link: '/volunteer',
				icon: Users2Icon,
				permissions: 'volunteer',
			},
			{
				label: 'Volunteer Projects',
				link: '/volunteer/projects',
				icon: FolderOpenIcon,
				permissions: 'volunteer',
			},
			// {
			// 	label: 'Volunteer Sign-Up',
			// 	link: '/volunteer/signup',
			// 	icon: User2Icon,
			// 	permissions: 'volunteer',
			// },
			// {
			// 	label: 'Attendance Tracking',
			// 	link: '/volunteer/attendance',
			// 	icon: LineChartIcon,
			// 	permissions: 'volunteer',
			// },
		],
	},
	{ label: 'Admin', link: '/admin', icon: User2Icon, permissions: 'adminPanel' },
] as const;
