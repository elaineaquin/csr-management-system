'use client';

import { AccessGuard } from '@/components/access-guard';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetParticipatedProjects, useGetVolunteerTasks } from '@/hooks/use-volunteer';
import { formatDate } from '@/lib/utils';
import { EyeIcon } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
	const { data: projects, isLoading: loadingProjects, isError: errorProjects } = useGetParticipatedProjects();
	const { data: tasks, isLoading: loadingTasks, isError: errorTasks } = useGetVolunteerTasks();

	return (
		<AccessGuard page="volunteer">
			<PageHeader>
				<div>
					<PageHeaderHeading>Volunteer Dashboard</PageHeaderHeading>
					<PageHeaderDescription>Overview for all assigned projects and tasks</PageHeaderDescription>
				</div>
			</PageHeader>
			<SectionWrapper>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
					<div className="md:col-span-2 h-fit ">
						<h2 className="text-xl font-semibold mb-2">Projects</h2>
						{loadingProjects ? (
							<p>Loading projects...</p>
						) : errorProjects ? (
							<p className="text-red-500">Failed to load projects.</p>
						) : projects?.length === 0 ? (
							<p>No participated projects found.</p>
						) : (
							<div className="space-y-2">
								{(projects ?? []).map((project) => (
									<Card key={project.id}>
										<CardHeader>
											<CardTitle>{project.title}</CardTitle>
											<CardDescription>Created By {project.createdBy.name}</CardDescription>
											<CardAction>
												<Button size={'icon'} variant={'secondary'}>
													<Link href={`/project/${project.id}`}>
														<EyeIcon />
													</Link>
												</Button>
											</CardAction>
										</CardHeader>
										<CardContent>
											<div
												className="text-sm text-gray-500"
												dangerouslySetInnerHTML={{ __html: project.description }}
											/>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
					<div className="grid grid-cols-1 h-fit">
						<h2 className="text-xl font-semibold mb-2">Tasks</h2>
						{loadingTasks ? (
							<p>Loading tasks...</p>
						) : errorTasks ? (
							<p className="text-red-500">Failed to load tasks.</p>
						) : tasks?.length === 0 ? (
							<p>No assigned tasks found.</p>
						) : (
							<div className="space-y-2">
								{(tasks ?? []).map((task) => (
									<Card key={task.id}>
										<CardHeader>
											<CardTitle>{task.title}</CardTitle>
											<CardDescription>{task.description}</CardDescription>
											<CardAction>
												<Button size={'icon'} variant={'secondary'} asChild>
													<Link href={`/project/${task.column.board.projectId}/kanban`}>
														<EyeIcon />
													</Link>
												</Button>
											</CardAction>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-500">Column: {task.column.title}</p>
											{task.dueDate && <p className="text-sm text-gray-400">Due: {formatDate(task.dueDate)}</p>}
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</SectionWrapper>
		</AccessGuard>
	);
}
