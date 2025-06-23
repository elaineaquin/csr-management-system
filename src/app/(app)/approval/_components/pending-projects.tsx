'use client';

import { ChatContainer } from '@/components/chat';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { useGetProjectDiscussionRoomId, useGetProjectsList } from '@/hooks/use-project';
import { ProjectWithCreator } from '@/types/project.type';
import { EyeIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function PendingProjects() {
	const { data: projects, isLoading } = useGetProjectsList({ status: 'Pending', title: '' });

	if (isLoading || !projects) {
		return <div>Loading, please wait...</div>;
	}

	return (
		<div className="flex flex-col gap-4">
			{projects.map((project) => (
				<PendingProject project={project} key={project.id} />
			))}
		</div>
	);
}

function PendingProject({ project }: { project: ProjectWithCreator }) {
	const [openDiscussion, setOpenDiscussion] = useState(false);
	const { data: room, isLoading: loadingRoom } = useGetProjectDiscussionRoomId({ id: project.id });

	const handleGetProjectDiscussion = () => {
		setOpenDiscussion(true);
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>
						<Link href={`/project/${project.id}`} className="hover:underline">
							{project.title}
						</Link>
					</CardTitle>
					<CardDescription>Created By: {project.createdBy}</CardDescription>
					<CardAction className="flex items-center gap-2">
						<Button onClick={handleGetProjectDiscussion}>Open Discussion</Button>
						<Button variant={'secondary'} size={'icon'} asChild>
							<Link href={`/project/${project.id}`}>
								<EyeIcon />
							</Link>
						</Button>
					</CardAction>
				</CardHeader>
			</Card>
			<Drawer direction="right" open={openDiscussion} onOpenChange={setOpenDiscussion}>
				<DrawerContent>
					<DrawerHeader className="border-b-2">
						<DrawerTitle>{project.title}</DrawerTitle>
						<DrawerDescription>Project Discussions</DrawerDescription>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Close">
								<XIcon className="h-5 w-5" />
							</Button>
						</DrawerClose>
					</DrawerHeader>
					<div className="p-4 h-full overflow-y-auto flex">
						{loadingRoom ? (
							<div className="text-sm text-muted-foreground">Loading discussion room...</div>
						) : room?.id ? (
							<ChatContainer roomId={room.id} />
						) : (
							<div className="text-red-500">Room not found</div>
						)}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
