'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProjectWithCreator } from '@/types/project.type';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUpDownIcon, ClockIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { UserInfoCard } from '@/components/user-info-card';
import { getFormattedDate, getProposalStatusColor } from '@/lib/utils';
import { TableActions } from './table-actions';

export const columns: ColumnDef<ProjectWithCreator>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) => (
			<Button
				variant={'ghost'}
				className="w-full flex items-center justify-start"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Title
				<ArrowUpDown className="w-4 h-4 ml-2" />
			</Button>
		),
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<Button variant={'link'} asChild>
						<Link href={`/project/${project.id}`}>{project.title}</Link>
					</Button>
					{project.needsAttention && (
						<Badge
							variant="outline"
							className="ml-2 border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-300"
						>
							<ClockIcon className="h-4 w-4 mr-1" />
							Needs Attention
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: 'createdBy',
		header: 'Submitted By',
		cell: ({ row }) => {
			const project = row.original;
			return <UserInfoCard userId={project.createdById} userName={project.createdBy} />;
		},
	},
	{
		accessorKey: 'updatedAt',
		header: ({ column }) => {
			return (
				<Button
					variant={'ghost'}
					className="w-full flex items-center justify-start"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Last Updated
					<ArrowUpDownIcon />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.original.updatedAt;
			return getFormattedDate(date);
		},
	},
	{
		accessorKey: 'budget',
		header: ({ column }) => {
			return (
				<Button
					variant={'ghost'}
					className="w-full flex items-center justify-start"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Budget
					<ArrowUpDownIcon />
				</Button>
			);
		},
		cell: ({ row }) => {
			const budget = parseFloat(row.getValue('budget'));
			const formatted = new Intl.NumberFormat('fil-PH', {
				style: 'currency',
				currency: 'PHP',
			}).format(budget);
			return formatted;
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as ProjectWithCreator['status'];
			const className = `px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(status)}`;
			return <span className={className}>{status}</span>;
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			return <TableActions project={row.original} />;
		},
	},
];
