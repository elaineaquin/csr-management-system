'use client';

import { Button } from '@/components/ui/button';
import { UserInfoCard } from '@/components/user-info-card';
import { getFormattedDate } from '@/lib/utils';
import { DocumentFolder } from '@/types/document.type';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDownIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';
import { TableActions } from './table-actions';

export const columns: ColumnDef<DocumentFolder>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button
				variant="ghost"
				className="w-full flex items-center justify-start"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			>
				Name
				<ArrowUpDownIcon className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const name = row.getValue('name') as string;
			const folderId = row.original.id;
			return (
				<Button variant={'link'} asChild>
					<Link href={`/document/${folderId}`}>
						<FolderIcon /> {name}
					</Link>
				</Button>
			);
		},
	},
	{
		accessorKey: 'ownerId',
		header: 'Submitted By',
		cell: ({ row }) => {
			const folder = row.original;
			return <UserInfoCard userId={folder.ownerId} userName={folder.owner} />;
		},
	},
	{
		accessorKey: 'lastModified',
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
			const date = row.original.lastModified;
			return getFormattedDate(date);
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			return <TableActions folder={row.original} />;
		},
	},
];
