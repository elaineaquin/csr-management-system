'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createProjectSchema } from '@/lib/zod/project.schema';
import { ProjectDetails, ProjectWithCreator } from '@/types/project.type';
import { Prisma, ProjectStatusType } from '@prisma/client';
import { headers } from 'next/headers';
import { ZodError } from 'zod';

export async function getProjects({
	title,
	userId,
	statusFilter,
}: {
	title: string;
	userId?: string;
	statusFilter?: ProjectStatusType;
}): Promise<ProjectWithCreator[]> {
	const andConditions: {
		title?: { contains: string; mode: 'insensitive' };
		createdById?: string;
		status?: { equals: ProjectStatusType };
	}[] = [];

	if (title !== '') {
		andConditions.push({ title: { contains: title, mode: 'insensitive' } });
	}

	if (userId) {
		andConditions.push({ createdById: userId });
	}

	if (statusFilter) {
		andConditions.push({ status: { equals: statusFilter } });
	}

	const projects = await prisma.project.findMany({
		include: { createdBy: true },
		where: andConditions.length > 0 ? { AND: andConditions } : undefined,
		orderBy: {
			needsAttention: 'desc',
		},
	});

	return projects.map((project) => ({
		...project,
		createdBy: project.createdBy.name,
		status: project.status as ProjectStatusType,
	}));
}

export async function createProject(data: Prisma.ProjectCreateInput) {
	try {
		const userId = data.createdBy?.connect?.id;
		const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
		const titleExists = await prisma.project.findUnique({
			where: { title: data.title },
		});
		if (titleExists) {
			throw new Error('Project title already exists');
		}

		const timeline = { from: data.from, to: data.to };
		const parsed = createProjectSchema.parse({ ...data, timeline });

		return await prisma.$transaction(async (tx) => {
			const project = await tx.project.create({
				data: {
					...data,
					from: parsed.timeline.from,
					to: parsed.timeline.to,
				},
			});

			await tx.projectHistory.create({
				data: {
					projectId: project.id,
					title: 'Project Created',
					subtitle: `Created by ${user?.name || 'system'}`,
				},
			});

			return project;
		});
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('Validation failed:', error.errors);
			throw new Error('Invalid project data');
		}
		console.error('Project creation failed:', error);
		throw new Error('Failed to create project');
	}
}

export async function getProjectById({ id }: { id: string }): Promise<ProjectDetails> {
	const project = await prisma.project.findUnique({
		where: { id },
		include: {
			volunteerRequests: true,
			createdBy: true,
			documents: {
				include: {
					documentVersions: {
						take: 1,
						orderBy: {
							createdAt: 'desc',
						},
						include: {
							attachment: true,
						},
					},
				},
			},
		},
	});
	if (!project) {
		throw new Error('Project not found');
	}

	return {
		id: project.id,
		title: project.title,
		status: project.status,
		description: project.description,
		createdById: project.createdById,
		createdBy: project.createdBy.name,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		budget: project.budget,
		from: project.from,
		to: project.to,
		needsAttention: project.needsAttention,
		documents: project.documents.map((doc) => ({
			id: doc.id,
			title: doc.title,
			url: doc.documentVersions[0].attachment.storageId,
			size: doc.documentVersions[0].attachment.size,
			type: doc.documentVersions[0].attachment.type,
			version: doc.documentVersions[0].version,
			archived: doc.archived,
		})),
		revisionRequest: project.revisionRequest,
		revisionReason: project.revisionReason || '',
		rejectedReason: project.rejectedReason || '',
		hasVolunteerRequest: project.volunteerRequests.length > 0,
		requestId: project.volunteerRequests?.[0]?.id ?? null,
	};
}

export async function deleteProject({ id }: { id: string }) {
	try {
		return await prisma.$transaction([
			prisma.volunteerRequest.deleteMany({ where: { projectId: id } }),
			prisma.fundRequest.deleteMany({ where: { projectId: id } }),
			prisma.document.deleteMany({ where: { projectId: id } }),
			prisma.projectHistory.deleteMany({ where: { projectId: id } }),
			prisma.project.delete({ where: { id } }),
		]);
	} catch (error) {
		console.error('Failed to delete project:', error);
		throw new Error('Failed to delete project');
	}
}

export async function updateProject(id: string, data: Prisma.ProjectUpdateInput) {
	const existingProject = await prisma.project.findUnique({
		where: { id },
		include: { createdBy: true },
	});
	if (!existingProject) {
		throw new Error('Project not found');
	}
	await prisma.project.update({ where: { id }, data });
	return {
		id,
		title: data.title ?? existingProject.title,
		status: data.status ?? existingProject.status,
		createdById: existingProject.createdById,
	};
}

export async function getDashboardOverview() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			throw new Error('Unauthorized access');
		}
		const volunteersCount = await prisma.user.count({
			where: {
				role: {
					contains: 'u5',
					mode: 'insensitive', // Optional: ensures case-insensitive matching
				},
			},
		});

		const totalProjects = await prisma.project.count();
		const completedProjects = await prisma.project.count({
			where: { status: 'Completed' },
		});
		const availableBudget = await prisma.project.aggregate({
			_sum: { budget: true },
		});

		const recentProjects = await prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
			include: { createdBy: true },
		});

		const allFundRequests = await prisma.fundRequest.findMany({
			select: {
				amount: true,
				status: true,
				category: true,
			},
		});

		const recentVolunteerRequests = await prisma.volunteerRequest.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
			include: {
				_count: {
					select: {
						volunteers: true,
					},
				},
				project: true, // Assuming it's linked to a project
			},
		});

		const categoryMap = new Map<string, { name: string; allocated: number; spent: number }>();
		for (const request of allFundRequests) {
			const { category, amount, status } = request;

			if (!categoryMap.has(category)) {
				categoryMap.set(category, {
					name: category,
					allocated: 0,
					spent: 0,
				});
			}

			const entry = categoryMap.get(category)!;
			entry.allocated += amount;
			if (status.toLowerCase() === 'released') {
				entry.spent += amount;
			}
		}

		return {
			totalProjects,
			completedProjects,
			availableBudget: availableBudget._sum.budget || 0,
			recentProjects,
			volunteersCount: volunteersCount,
			recentVolunteerRequests: recentVolunteerRequests.map((recent) => ({
				...recent,
				title: recent.project.title,
				participated: recent._count.volunteers,
			})),
			categoryMap: Array.from(categoryMap.values()).map((entry) => ({
				...entry,
				percentage: entry.allocated > 0 ? Math.round((entry.spent / entry.allocated) * 100) : 0,
			})),
		};
	} catch (error) {
		console.error('Failed to fetch dashboard overview:', error);
	}
}

export async function getProjectHistory({ id }: { id: string }) {
	return await prisma.projectHistory.findMany({
		where: { projectId: id },
		orderBy: { createdAt: 'desc' },
	});
}

export async function createRequestParticipants(data: Prisma.VolunteerRequestCreateInput) {
	try {
		const newRequest = await prisma.volunteerRequest.create({ data, include: { project: true } });
		return { ...newRequest, title: newRequest.project.title };
	} catch (error) {
		console.error('Project creation failed:', error);
		throw new Error('Failed to create project');
	}
}

export async function createProjectHistory(data: Prisma.ProjectHistoryCreateInput) {
	return await prisma.projectHistory.create({ data });
}

// Who can access the Kanban board?
// 1. Project Owner
// 2. Users with role 'u1'
// 3. Volunteer members
export async function canAccessKanban({ projectId }: { projectId: string }): Promise<boolean> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user.id;

	if (!userId) return false;

	// Rule 2: Check special role
	if (session.user.role?.includes('u1')) return true;

	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			createdById: true,
			volunteerRequests: {
				select: {
					volunteers: {
						select: {
							userId: true,
						},
					},
				},
			},
		},
	});

	if (!project) return false;

	// Rule 1: Project Owner
	if (project.createdById === userId) return true;

	// Rule 3: Is user in any volunteer list
	const allVolunteerUserIds = project.volunteerRequests.flatMap((vr) => vr.volunteers.map((v) => v.userId));

	return allVolunteerUserIds.includes(userId);
}

export async function getProjectDiscussionRoom({ id }: { id: string }) {
	const project = await prisma.project.findUnique({
		where: { id },
		select: {
			title: true,
			discussionId: true,
		},
	});

	if (!project) {
		throw new Error(`Project with id "${id}" not found`);
	}

	if (project.discussionId) {
		const existing = await prisma.discussionRoom.findUnique({
			where: { id: project.discussionId },
		});

		if (existing) {
			if (existing.name !== project.title) {
				const updated = await prisma.discussionRoom.update({
					where: { id: existing.id },
					data: { name: project.title },
				});
				return updated;
			}

			return existing;
		}
	}

	const created = await prisma.discussionRoom.create({
		data: {
			projectId: id,
			name: project.title,
		},
	});

	await prisma.project.update({
		where: { id },
		data: { discussionId: created.id },
	});

	return created;
}
