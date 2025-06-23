import { date, object, z, enum as zEnum, string } from 'zod';
import { getUuidSchema, getBudgetSchema, getTextAreaSchema } from '../schema';

export const expenseCategories = ['Training', 'Materials', 'Donations'] as const;

const getFundExpensesCategories = () =>
	zEnum(expenseCategories, {
		errorMap: () => ({ message: 'Select Valid expense category' }),
	});

export const createFundRequestSchema = object({
	projectId: getUuidSchema(),
	amount: getBudgetSchema(),
	justification: getTextAreaSchema('Justification'),
	category: getFundExpensesCategories(),
});

export type CreateFundRequestSchema = z.infer<typeof createFundRequestSchema>;

export const fundRequestDisburseSchema = object({
	referenceNumber: string()
		.min(1, 'Reference number is required')
		.regex(/^[A-Z0-9]{6,}$/, 'Must be at least 6 alphanumeric characters (uppercase)'),
	releaseDate: date().min(new Date(), 'Invalid release date'),
});

export type FundRequestDisburseSchema = z.infer<typeof fundRequestDisburseSchema>;
