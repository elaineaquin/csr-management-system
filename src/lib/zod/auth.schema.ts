import z from 'zod';
import { getEmailSchema, getNameSchema, getPasswordSchema } from '../schema';

export const signInSchema = z.object({
	email: getEmailSchema(),
	password: getPasswordSchema('password'),
	rememberMe: z.boolean(),
});

export const signUpSchema = z
	.object({
		name: getNameSchema(),
		email: getEmailSchema(),
		password: getPasswordSchema('password'),
		confirmPassword: getPasswordSchema('confirmPassword'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const changePasswordSchema = z
	.object({
		currentPassword: getPasswordSchema('currentPassword'),
		newPassword: getPasswordSchema('newPassword'),
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: 'New password must be different from the current password',
		path: ['newPassword'],
	});

export const resetPasswordSchema = z
	.object({
		password: getPasswordSchema('password'),
		confirmPassword: getPasswordSchema('confirmPassword'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const forgotPasswordSchema = z.object({
	email: getEmailSchema(),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
