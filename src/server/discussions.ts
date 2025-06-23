'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type MessageType = Prisma.MessageGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				name: true;
				image: true;
			};
		};
	};
}>;

export async function getDiscussionMessages({ roomId }: { roomId: string }) {
	const room = await prisma.discussionRoom.findUnique({
		where: { id: roomId },
		select: {
			messages: {
				orderBy: { createdAt: 'asc' },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
			},
		},
	});

	if (!room) {
		throw new Error('Discussion room not found');
	}

	return room.messages ?? [];
}

export async function sendMessage({
	roomId,
	userId,
	content,
}: {
	roomId: string;
	userId: string;
	content: string;
}): Promise<MessageType> {
	const message = await prisma.message.create({
		data: {
			roomId,
			userId,
			content,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	});
	return message;
}
