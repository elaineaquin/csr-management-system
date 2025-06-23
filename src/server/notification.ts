'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { RoleKey } from '@/lib/permissions';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function getMyNotification() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	if (session.user.banned) {
		throw new Error('You are banned');
	}

	try {
		const notifications = await prisma.notification.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: 'desc' },
		});
		return notifications ?? [];
	} catch (error) {
		console.error('Notification creation failed:', error);
		throw new Error('Failed to create notificaiton');
	}
}

export async function broadcastNotification({
	data,
	roles,
}: {
	data: { link: string; message: string };
	roles: RoleKey[];
}) {
	try {
		const users = await prisma.user.findMany({
			where: {
				OR: roles.map((role) => ({ role: { contains: role } })),
			},
			select: {
				id: true,
			},
		});

		const notifications = users.map((user) => ({ ...data, userId: user.id, read: false }));
		await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
	} catch (error) {
		console.error('Notification creation failed:', error);
		throw new Error('Failed to create notificaiton');
	}
}

export async function saveNotification(data: Prisma.NotificationCreateInput) {
	try {
		return await prisma.notification.create({ data });
	} catch (error) {
		console.error('Notification creation failed:', error);
		throw new Error('Failed to create notificaiton');
	}
}

export async function markNotificationAsRead({ notificationId }: { notificationId: string }) {
	try {
		return await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
	} catch (error) {
		console.error('Notification marking failed:', error);
		throw new Error('Failed to mark notification as read');
	}
}

export async function markAllNotificationsAsRead({ userId }: { userId: string }) {
	try {
		return await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
	} catch (error) {
		console.error('Notification marking failed:', error);
		throw new Error('Failed to mark all notifications as read');
	}
}

export async function deleteNotification({ notificationId }: { notificationId: string }) {
	try {
		return await prisma.notification.delete({ where: { id: notificationId } });
	} catch (error) {
		console.error('Notification deletion failed:', error);
		throw new Error('Failed to delete notification');
	}
}

export async function deleteAllNotifications({ userId }: { userId: string }) {
	try {
		return await prisma.notification.deleteMany({ where: { userId } });
	} catch (error) {
		console.error('Notification deletion failed:', error);
		throw new Error('Failed to delete notifications');
	}
}
