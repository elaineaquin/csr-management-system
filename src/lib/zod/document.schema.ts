import { z } from 'zod';

export const documentCategories = ['Reports', 'Contracts', 'Compliance', 'Proposals'] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export const documentPermissions = ['READ', 'WRITE', 'OWNER'] as const;
export type DocumentPermission = (typeof documentPermissions)[number];

export const createDocumentSchema = z.object({
	title: z.string().min(1, { message: 'Title is required' }),
	category: z.enum(documentCategories, {
		errorMap: () => ({ message: 'Select valid document category' }),
	}),
});

export const addNewVersionSchema = z.object({
	message: z.string().min(1, { message: 'Message is required' }),
	version: z.string().min(1, { message: 'Version is required' }),
});

export type CreateDocumentSchema = z.infer<typeof createDocumentSchema>;
export type AddNewVersionSchema = z.infer<typeof addNewVersionSchema>;
