'use client';

import { FundRequest } from '@/types/fund-request.types';
import {
	ColumnDef,
	flexRender,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
} from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useGetFundRequests } from '@/hooks/use-fund-request';
import { createAuthClient } from 'better-auth/react';
import { useState } from 'react';
import { FilterIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const { useSession } = createAuthClient();

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	userOnly?: boolean;
	recent?: boolean;
}

export function DataTable<TValue>({ userOnly, recent, columns }: DataTableProps<FundRequest, TValue>) {
	const { data: session } = useSession();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const { data: fundRequests, isLoading } = useGetFundRequests({
		userId: userOnly ? session?.user.id : undefined,
		recent: recent ?? false,
	});

	const table = useReactTable({
		data: fundRequests ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[500px]">
				<Loader2 className="h-4 w-4 animate-spin" />
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center pb-4 gap-2">
				<Select
					value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
					onValueChange={(value) => {
						if (value === 'all') return table.getColumn('status')?.setFilterValue('');
						table.getColumn('status')?.setFilterValue(value);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
						<SelectItem value="released">Released</SelectItem>
					</SelectContent>
				</Select>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							<FilterIcon />
							Filter
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<DataTablePagination table={table} />
			</div>
		</>
	);
}
