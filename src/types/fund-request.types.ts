import { FundRequestCategoryType, FundRequestStatusType } from '@prisma/client';
import { AttachedDocument } from './document.type';

export type ExpenseCategorySummary = {
	total: number;
	count: number;
	category: FundRequestCategoryType;
} & Record<FundRequestStatusType, number>;

export type FundRequest = {
	id: string;
	amount: number;
	reason: string;
	status: FundRequestStatusType;
	category: FundRequestCategoryType;
	projectId: string;
	createdById: string;
	createdAt: Date;
	releaseDate: Date | null;
	referenceNumber: string | null;
	rejectedReason: string | null;
	createdBy: string;
	project: string;
};

export type FundRequestDetails = {
	id: string;
	amount: number;
	reason: string;
	status: string;
	category: string;
	projectId: string;
	createdById: string;
	createdAt: Date;
	releaseDate: Date | null;
	referenceNumber: string | null;
	rejectedReason: string | null;
	project: string;
	documents: AttachedDocument[];
	createdBy: string;
};

export interface FundRequestHistoryData {
	total: number;
	histories: ProjectHistory[];
}

export interface ProjectHistory {
	id: string;
	title: string;
	budget: number;
	description: string;
	status: string;
	needsAttention: boolean;
	from: Date;
	to: Date;
	createdAt: Date;
	updatedAt: Date;
	createdById: string;
	revisionRequest: boolean;
	revisionReason: string | null;
	rejectedReason: string | null;
	fundRequests: {
		id: string;
		amount: number;
		reason: string;
		status: string;
		category: string;
		projectId: string;
		createdById: string;
		createdAt: Date;
		releaseDate: Date | null;
		referenceNumber: string | null;
		rejectedReason: string | null;
	}[];
}
