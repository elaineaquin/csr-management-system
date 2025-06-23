'use client ';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfoCard } from '@/components/user-info-card';
import { formatCurrency, getFormattedDate } from '@/lib/utils';
import { FundRequest } from '@/types/fund-request.types';
import { ColumnDef } from '@tanstack/react-table';
import { EllipsisVerticalIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const columns: ColumnDef<FundRequest>[] = [
	{
		accessorKey: 'project',
		header: 'Project',
		cell: ({ row }) => {
			const project = row.original;
			return (
				<div className="flex items-center gap-2">
					<Button variant={'link'} asChild>
						<Link href={`/project/${project.projectId}`}>{project.project}</Link>
					</Button>
				</div>
			);
		},
	},
	{
		accessorKey: 'category',
		header: 'Category',
		cell: ({ row }) => {
			const category = row.original.category;
			return <Badge variant={'outline'}>{category}</Badge>;
		},
	},
	{
		accessorKey: 'amount',
		header: 'Amount',
		cell: ({ row }) => {
			const amount = row.original.amount;
			return <div>{formatCurrency(amount)}</div>;
		},
	},
	{
		accessorKey: 'createdBy',
		header: 'Requested By',
		cell: ({ row }) => {
			const original = row.original;
			return <UserInfoCard userId={original.createdById} userName={original.createdBy} />;
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Created At',
		cell: ({ row }) => {
			const date = row.original.createdAt;
			return getFormattedDate(date);
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status;
			const variant =
				status === 'Released'
					? 'outline'
					: status === 'Approved'
					? 'default'
					: status === 'Pending'
					? 'default'
					: 'destructive';
			return (
				<Badge
					variant={variant}
					className={status === 'Released' ? 'text-green-500 dark:text-green-400 bg-green-200 dark:bg-green-900' : ''}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		id: 'actions',
		cell: function ActionsCell({ row }) {
			const fundRequest = row.original;
			const router = useRouter();

			return (
				<div className="flex justify-end">
					<Button variant={'ghost'} size={'icon'} onClick={() => router.push(`/finance/${fundRequest.id}`)}>
						<EyeIcon className="h-4 w-4" />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant={'ghost'} size={'icon'}>
								<EllipsisVerticalIcon className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(fundRequest.id);
									toast.info('Project id has been copied to clipboard');
								}}
							>
								Copy project ID
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
