'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserInfoCard } from '@/components/user-info-card';
import { getFormattedDate, getTypeLabel } from '@/lib/utils';
import { DocumentRepository } from '@/types/document.type';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDownIcon } from 'lucide-react';
import { TableActions } from './table-actions';

export const columns: ColumnDef<DocumentRepository>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="w-full flex items-center justify-start"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Document Name
				<ArrowUpDownIcon className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: 'filename',
		header: 'Filename',
		cell: ({ row }) => {
			const filename = row.original.filename;
			return <span>{filename}</span>;
		},
	},
	{
		accessorKey: 'category',
		header: 'Category',
		cell: ({ row }) => {
			const category = row.original.category;
			return <Badge variant={'default'}>{category}</Badge>;
		},
	},
	{
		accessorKey: 'version',
		header: 'Version',
		cell: ({ row }) => {
			const version = row.original.version;
			return version;
		},
	},
	{
		accessorKey: 'createdBy',
		header: 'Submitted By',
		cell: ({ row }) => {
			const document = row.original;
			return <UserInfoCard userId={document.createdById} userName={document.createdBy} />;
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
		accessorKey: 'type',
		header: 'Type',
		cell: ({ row }) => {
			const type = row.original.type;
			return getTypeLabel(type);
		},
	},
	{
		accessorKey: 'size',
		header: 'Size',
		cell: ({ row }) => {
			const size = row.original.size;
			const formatSize = (bytes: number) => {
				if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
				if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
				return `${bytes} B`;
			};
			return <span>{formatSize(size)}</span>;
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const document = row.original;
			return <TableActions documentRepo={document} />;
		},
	},
];
