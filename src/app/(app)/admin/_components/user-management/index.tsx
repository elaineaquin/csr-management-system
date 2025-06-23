'use client';

import { useState } from 'react';
import {
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	flexRender,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetUsersList } from '@/hooks/use-auth';
import { DataTablePagination } from '@/components/data-table-pagination';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FilterIcon, SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { columns } from './columns';
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from '@/components/ui/select';
import { roleMap } from '@/components/role-display';

export function UserManagement() {
	// states
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [searchFilter, setSearchFilter] = useState('');

	// hooks
	const debouncedSearchFilter = useDebounce(searchFilter, 500);
	const { data, isLoading } = useGetUsersList({
		limit: 10,
		offset: 0,
		searchValue: debouncedSearchFilter,
	});

	const table = useReactTable({
		data: data?.users || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setSearchFilter,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			globalFilter: debouncedSearchFilter,
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					<div className="relative w-full max-w-sm">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search users..."
							value={searchFilter}
							onChange={(event) => setSearchFilter(event.target.value)}
							className="pl-8"
						/>
					</div>
					<Select
						value={(table.getColumn('role')?.getFilterValue() as string) ?? ''}
						onValueChange={(value) => {
							if (value === 'all') return table.getColumn('role')?.setFilterValue('');
							table.getColumn('role')?.setFilterValue(value);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Filter by Roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{Object.entries(roleMap).map(([key, value]) => (
								<SelectItem key={key} value={key}>
									{value.icon}
									{value.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon">
							<FilterIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table.getAllColumns().map((column) => {
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
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
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
			<DataTablePagination table={table} />
		</div>
	);
}
