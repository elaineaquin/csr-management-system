'use client';

import { AddColumnForm } from '@/components/kanban-board/add-column-form';
import { AddTaskForm } from '@/components/kanban-board/add-task-form';
import { KanbanBoard } from '@/components/kanban-board/index';
import { ListView } from '@/components/list-view';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAddKanbanCardTask, useAddKanbanColumn, useGetKanbanBoard } from '@/hooks/use-kanban';
import { useCanAccessKanbanBoard } from '@/hooks/use-permissions';
import { ArrowLeftIcon, KanbanIcon, ListIcon, PlusCircleIcon, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProjectKanbanPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: hasAccess } = useCanAccessKanbanBoard({ projectId: id as string });
	const { data: board, isLoading, error, refetch } = useGetKanbanBoard({ projectId: id as string });
	const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
	const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
	const { mutateAsync: addTaskCard } = useAddKanbanCardTask();
	const { mutateAsync: addColumn } = useAddKanbanColumn();

	// Loading skeleton
	if (isLoading || !board) {
		return (
			<>
				<PageHeader>
					<Button variant="ghost" size="icon" className="mr-2">
						<ArrowLeftIcon />
					</Button>
					<div className="w-full">
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-96" />
					</div>
					<Skeleton className="h-6 w-24" />
				</PageHeader>

				<SectionWrapper>
					<Card>
						<CardContent className="space-y-6 pt-6">
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-3/4" />
							</div>
							<Separator />
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Separator />
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="flex items-start space-x-2 mb-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-40" />
									</div>
								))}
							</div>
							<Separator />
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								{[1, 2].map((i) => (
									<Skeleton key={i} className="h-20 w-full mb-4 rounded-xl" />
								))}
							</div>
						</CardContent>
					</Card>
				</SectionWrapper>
			</>
		);
	}

	// Handle error state
	if (error) {
		return (
			<Card className="mx-auto max-w-2xl mt-8">
				<CardHeader>
					<CardTitle className="text-destructive">Error Loading Project</CardTitle>
				</CardHeader>
				<CardContent>
					<p>We couldn&apos;t load the project details. Please try again later.</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.back()}>Go Back</Button>
					<Button variant="outline" className="ml-2" onClick={() => router.refresh()}>
						Retry
					</Button>
				</CardFooter>
			</Card>
		);
	}

	// Vaildate user if can access the kanban
	if (!hasAccess) {
		return (
			<Card className="mx-auto max-w-2xl mt-8">
				<CardHeader>
					<CardTitle className="text-destructive">Unaccessible</CardTitle>
				</CardHeader>
				<CardContent>
					<p>You are not part of the Project Team</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.back()}>Go Back</Button>
					<Button variant="outline" className="ml-2" onClick={() => router.refresh()}>
						Retry
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<>
			<PageHeader>
				<Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
					<ArrowLeftIcon className="h-5 w-5" />
				</Button>
				<div className="flex-1 flex flex-col gap-2">
					<PageHeaderHeading>{board.name}</PageHeaderHeading>
					<PageHeaderDescription>Project Tasks & Management</PageHeaderDescription>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<div className="flex -space-x-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<Users className="h-4 w-4 mr-2" />
										Team
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>Team Members</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>{board.owner.name} (Owner)</DropdownMenuItem>
									{board.members.map((member) => (
										<DropdownMenuItem key={member.id}>{member.name}</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</PageHeader>
			<SectionWrapper>
				<div className="w-full gap-2 flex justify-end">
					<Button size={'lg'} onClick={() => setAddTaskDialogOpen(true)}>
						Add Task <PlusCircleIcon />
					</Button>
					<Button variant={'outline'} size={'lg'} onClick={() => setAddColumnDialogOpen(true)}>
						Add Column <PlusCircleIcon />
					</Button>
				</div>
				<Tabs defaultValue="kanban">
					<TabsList>
						<TabsTrigger value="kanban">
							<KanbanIcon className="h-4 w-4 mr-2" /> Kanban Board
						</TabsTrigger>
						<TabsTrigger value="list">
							<ListIcon className="h-4 w-4 mr-2" /> List View
						</TabsTrigger>
					</TabsList>
					<TabsContent value="kanban">
						<KanbanBoard board={board} />
					</TabsContent>
					<TabsContent value="list">
						<ListView board={board} />
					</TabsContent>
				</Tabs>

				<AddTaskForm
					addTaskDialogOpen={addTaskDialogOpen}
					setAddTaskDialogOpen={setAddTaskDialogOpen}
					projectId={id as string}
					onSave={async (data) => {
						const id = toast.loading('Saving task');
						try {
							await addTaskCard(data);
							await refetch();
							toast.success('Task saved', { id });
						} catch {
							toast.error('Something went wrong', { id });
						}
					}}
				/>
				<AddColumnForm
					addColumnDialogOpen={addColumnDialogOpen}
					setAddColumnDialogOpen={setAddColumnDialogOpen}
					projectId={id as string}
					onSave={async (data) => {
						const id = toast.loading('Saving Column');
						try {
							await addColumn(data);
							await refetch();
							toast.success('Column saved', { id });
						} catch {
							toast.error('Something went wrong', { id });
						}
					}}
				/>
			</SectionWrapper>
		</>
	);
}
