'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FundRequest } from '@/types/fund-request.types';
import { DisburseForm } from './disburse-form';
import { formatCurrency, getFormattedDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserInfoCard } from '@/components/user-info-card';

export const disburseColumns: ColumnDef<FundRequest>[] = [
	{
		accessorKey: 'project',
		header: 'Project',
		cell: ({ row }) => {
			const project = row.original;
			return <div>{project.project}</div>;
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
			const variant = status === 'Approved' ? 'default' : status === 'Pending' ? 'outline' : 'destructive';
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return <DisburseForm fundRequestId={row.original.id} />;
		},
	},
];
