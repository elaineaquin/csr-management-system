import { coerce, object, z } from 'zod';
import { getTitleSchema, getTextAreaSchema, getBudgetSchema } from '../schema';

export const createProjectSchema = object({
	title: getTitleSchema(),
	description: getTextAreaSchema('Description'),
	budget: getBudgetSchema(),
	timeline: object({
		from: coerce.date(),
		to: coerce.date(),
	}).refine((data) => data.to > data.from, { message: 'End date must be after start date', path: ['to'] }),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
