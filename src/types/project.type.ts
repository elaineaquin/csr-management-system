import { ProjectStatusType } from '@prisma/client';
import { AttachedDocument } from './document.type';

export type ProjectWithCreator = {
	id: string;
	title: string;
	budget: number;
	status: ProjectStatusType;
	needsAttention: boolean;
	updatedAt: Date;
	createdBy: string;
	createdById: string;
	folderId?: string;
};

export type ProjectDetails = {
	id: string;
	title: string;
	status: ProjectStatusType;
	description: string;
	createdById: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	budget: number;
	from: Date;
	to: Date;
	needsAttention: boolean;
	documents: AttachedDocument[];
	revisionRequest: boolean;
	revisionReason: string;
	rejectedReason: string;
	hasVolunteerRequest: boolean;
	requestId?: string;
};
