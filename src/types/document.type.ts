import { DocumentCategory, DocumentPermission } from '@/lib/zod/document.schema';

export type DocumentFolder = {
	id: string;
	name: string;
	ownerId: string;
	owner: string;
	lastModified: Date;
	isRestricted: boolean;
	shared: {
		id: string;
		name: string;
		email: string;
		permission: DocumentPermission;
	}[];
	inviteToken?: string | null;
};

export type DocumentRepository = {
	archived: boolean;
	folderId: string;
	category: DocumentCategory;
	createdBy: string;
	createdById: string;
	id: string;
	size: number;
	title: string;
	type: string;
	updatedAt: Date;
	version: string;
	url: string;
	filename: string;
};

export type AttachedDocument = {
	id: string;
	title: string;
	url: string;
	size: number;
	type: string;
	version: string;
	archived: boolean;
};

export type DocumentVersionView = {
	id: string;
	title: string;
	url: string;
	size: number;
	type: string;
	createdBy: string;
	createdAt: Date;
	version: string;
	message: string;
};
