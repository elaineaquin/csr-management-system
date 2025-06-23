'use server';

import prisma from '@/lib/prisma';
import {
	FundRequest,
	FundRequestDetails,
	ExpenseCategorySummary,
	FundRequestHistoryData,
} from '@/types/fund-request.types';
import { FundRequestCategoryType, FundRequestStatusType, Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function createFundRequest(data: Prisma.FundRequestCreateInput) {
	try {
		const projectId = data.project?.connect?.id;
		if (!projectId) {
			throw new Error('Missing project ID');
		}

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			throw new Error('Project not found');
		}

		const existingRequestsSum = await prisma.fundRequest.aggregate({
			where: {
				project: {
					id: projectId,
				},
				status: {
					equals: 'Rejected',
				},
			},
			_sum: {
				amount: true,
			},
		});

		const totalAllocated = existingRequestsSum._sum.amount ?? 0;
		const newTotal = totalAllocated + data.amount;

		if (newTotal > project.budget) {
			throw new Error(`This request exceeds the project's remaining budget of Php ${project.budget - totalAllocated}`);
		}

		await prisma.projectHistory.create({
			data: {
				projectId: projectId,
				title: 'Fund Request Created',
				subtitle: `Amount: ${data.amount}, Category: ${data.category}`,
			},
		});

		return await prisma.fundRequest.create({ data });
	} catch (error) {
		console.error('Fund request creation failed:', error);
		if (error instanceof Error) {
			throw new Error(error.message);
		}

		throw new Error(error instanceof ZodError ? 'Invalid fund request data' : 'Failed to create fund request');
	}
}

export async function getFundRequests({
	title,
	userId,
	recent,
	status,
}: {
	title: string;
	userId?: string;
	recent?: boolean;
	status?: FundRequestStatusType;
}): Promise<FundRequest[]> {
	const andConditions: {
		title?: { contains: string; mode: 'insensitive' };
		createdById?: string;
		status?: { equals: FundRequestStatusType };
		createdAt?: { gte: Date };
	}[] = [];
	if (title !== '') {
		andConditions.push({
			title: { contains: title, mode: 'insensitive' },
		});
	}
	if (userId) {
		andConditions.push({ createdById: userId });
	}
	if (recent) {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		andConditions.push({
			createdAt: {
				gte: oneWeekAgo,
			},
		});
	}
	if (status) {
		andConditions.push({
			status: {
				equals: status,
			},
		});
	}
	const fundRequests = await prisma.fundRequest.findMany({
		where: {
			AND: andConditions,
		},
		include: {
			createdBy: {
				select: {
					name: true,
				},
			},
			project: {
				select: {
					title: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	return fundRequests.map((request) => ({
		...request,
		status: request.status as FundRequestStatusType,
		category: request.category as FundRequestCategoryType,
		project: request.project.title,
		createdBy: request.createdBy.name,
	}));
}

export async function getFinancialOverview() {
	const totalBudget = await prisma.project.aggregate({
		_sum: {
			budget: true,
		},
	});

	const allProjectFundRequests = await prisma.project.findMany({
		include: {
			fundRequests: {
				select: {
					amount: true,
					status: true,
					category: true,
				},
				where: {
					NOT: {
						status: 'Rejected',
					},
				},
			},
		},
	});

	const projectMap = allProjectFundRequests.map((project) => {
		let allocated = 0;
		let spent = 0;

		for (const request of project.fundRequests) {
			allocated += request.amount;
			if (request.status.toLowerCase() === 'released') {
				spent += request.amount;
			}
		}

		return {
			name: project.title,
			budget: project.budget,
			allocated,
			spent,
			percentage: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
		};
	});

	const allFundRequests = await prisma.fundRequest.findMany({
		select: {
			amount: true,
			status: true,
			category: true,
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
		totalBudget: totalBudget._sum.budget,
		projectMap,
		categoryMap: Array.from(categoryMap.values()).map((entry) => ({
			...entry,
			percentage: entry.allocated > 0 ? Math.round((entry.spent / entry.allocated) * 100) : 0,
		})),
	};
}

export async function getFundRequestById({ id }: { id: string }): Promise<FundRequestDetails> {
	const fundRequest = await prisma.fundRequest.findUnique({
		where: { id },
		include: {
			createdBy: true,
			project: true,
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
	if (!fundRequest) {
		throw new Error('Fund request not found');
	}

	return {
		id: fundRequest.id,
		amount: fundRequest.amount,
		reason: fundRequest.reason,
		status: fundRequest.status,
		category: fundRequest.category,
		projectId: fundRequest.projectId,
		createdById: fundRequest.createdById,
		createdAt: fundRequest.createdAt,
		releaseDate: fundRequest.releaseDate,
		referenceNumber: fundRequest.referenceNumber,
		rejectedReason: fundRequest.rejectedReason,
		project: fundRequest.project.title,
		documents:
			fundRequest.documents?.map((doc) => ({
				id: doc.id,
				title: doc.title,
				url: doc.documentVersions[0].attachment.storageId,
				size: doc.documentVersions[0].attachment.size,
				type: doc.documentVersions[0].attachment.type,
				version: doc.documentVersions[0].version,
				archived: doc.archived,
			})) || [],
		createdBy: fundRequest.createdBy.name,
	};
}

export async function updateFundRequest(id: string, data: Prisma.FundRequestUpdateInput) {
	await prisma.fundRequest.update({ where: { id }, data });

	const fundRequest = await prisma.fundRequest.findUnique({
		where: { id },
		include: {
			createdBy: true,
			project: true,
		},
	});

	return { ...fundRequest, project: fundRequest?.project.title ?? '' };
}

export async function deleteFundRequest({ id }: { id: string }) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		const fundRequest = await prisma.fundRequest.findUnique({ where: { id }, select: { createdById: true } });
		const isOwner = session?.user.id === fundRequest?.createdById;
		const hasPermission = await auth.api.userHasPermission({
			body: {
				permission: {
					fundRequest: ['delete'],
				},
			},
		});

		if (!isOwner || !hasPermission.success) {
			throw new Error('You do not have permission to delete this fund request');
		}

		return await prisma.fundRequest.delete({ where: { id }, include: { documents: true } });
	} catch (error) {
		console.error('Failed to delete fund request:', error);
		throw new Error('Failed to delete fund request');
	}
}

export async function getFundRequestHistory({ from, to }: { from: Date; to: Date }): Promise<FundRequestHistoryData> {
	const fundRequestHistory = await prisma.project.findMany({
		where: {
			AND: [{ from: { lte: to } }, { to: { gte: from } }],
		},
		include: {
			fundRequests: {
				orderBy: { createdAt: 'desc' },
			},
		},
		orderBy: {
			from: 'asc',
		},
	});

	return {
		total: fundRequestHistory.length,
		histories: fundRequestHistory,
	};
}

export async function getExpensesSummary({ from, to }: { from: Date; to: Date }) {
	const fundRequests = await prisma.fundRequest.findMany({
		where: {
			createdAt: {
				gte: from,
				lte: to,
			},
		},
		select: {
			category: true,
			amount: true,
			status: true,
		},
	});

	const summaryMap = new Map<string, ExpenseCategorySummary>();
	for (const request of fundRequests) {
		const { category, amount, status } = request;

		if (!summaryMap.has(category)) {
			summaryMap.set(category, {
				category: category as FundRequestCategoryType,
				total: 0,
				count: 0,
				Pending: 0,
				Approved: 0,
				Rejected: 0,
				Released: 0,
			});
		}

		const summary = summaryMap.get(category)!;
		summary.total += amount;
		summary.count += 1;

		// Ensure status is lowercase to match type if needed
		const normalizedStatus = status.toLowerCase() as FundRequestStatusType;
		summary[normalizedStatus] += amount;
	}
	// Convert map to array
	const expensesSummary: ExpenseCategorySummary[] = Array.from(summaryMap.values());
	return expensesSummary;
}

export async function getApprovalTurnAroundTime({ from, to }: { from: Date; to: Date }) {
	const status: FundRequestStatusType[] = ['Approved', 'Released'];
	const approvalEfficiency = await prisma.fundRequest.findMany({
		where: {
			status: {
				in: status,
			},
			releaseDate: {
				not: null,
			},
			createdAt: {
				gte: from,
				lte: to,
			},
		},
		select: {
			id: true,
			createdAt: true,
			releaseDate: true,
		},
	});

	const turnaroundData = approvalEfficiency.map((req) => ({
		id: req.id,
		turnaroundHours: (req.releaseDate!.getTime() - req.createdAt.getTime()) / 36e5, // 36e5 = 60*60*1000
	}));

	const totalRequests = turnaroundData.length;
	const avgTurnaround =
		totalRequests > 0 ? turnaroundData.reduce((sum, item) => sum + item.turnaroundHours, 0) / totalRequests : 0;

	return {
		averageTurnaroundHours: parseFloat(avgTurnaround.toFixed(2)),
		totalRequests,
		details: turnaroundData, // Optional: remove if not needed
	};
}
