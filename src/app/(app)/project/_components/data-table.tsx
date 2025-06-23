'use client';

import { useGetProjectsList } from '@/hooks/use-project';
import {
	ColumnDef,
	ColumnFiltersState,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
	flexRender,
} from '@tanstack/react-table';
import { ProjectWithCreator } from '@/types/project.type';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Loading } from '@/components/loading';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterIcon, SearchIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { ProjectStatusType } from '@prisma/client';

interface DataTableProps<TValue> {
	columns: ColumnDef<ProjectWithCreator, TValue>[];
	statusFilter?: ProjectStatusType;
	userOnly?: boolean;
}

export function DataTable<TValue>({ columns, statusFilter, userOnly }: DataTableProps<TValue>) {
	// states
	const [searchInput, setSearchInput] = useState<string>('');
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	// hooks
	const debouncedSearchInput = useDebounce(searchInput, 500);
	const { data, isLoading } = useGetProjectsList({ title: debouncedSearchInput, status: statusFilter, userOnly });
	const table = useReactTable({
		data: data || [],
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

	if (isLoading) return <Loading />;

	return (
		<>
			<div className="flex items-center py-4 gap-1">
				<Input
					placeholder="Search Title"
					value={searchInput}
					onChange={(event) => setSearchInput(event.target.value)}
					className="max-w-sm"
				/>
				<Button type="button" size={'icon'} variant="ghost">
					<SearchIcon />
				</Button>
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
