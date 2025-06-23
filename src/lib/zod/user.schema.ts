import { z } from 'zod';

export const banUserSchema = z
	.object({
		banReason: z.string().min(1, 'Ban reason is required'),
		banExpires: z
			.number()
			.min(1, 'Ban expiration must be at least 1 day')
			.max(15, 'Ban expiration must be less than 15 days')
			.optional(),
		permanent: z.boolean(),
	})
	.refine((data) => data.permanent || data.banExpires !== undefined, {
		message: 'Ban duration is required unless it is a permanent ban',
		path: ['banExpires'],
	});

export type BanUserSchema = z.infer<typeof banUserSchema>;
