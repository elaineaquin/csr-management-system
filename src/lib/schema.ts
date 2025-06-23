import { number, string } from 'zod';
import { humanizeFieldName } from './utils';

export const getPasswordSchema = (type: 'password' | 'confirmPassword' | 'newPassword' | 'currentPassword') =>
	string({ required_error: `${humanizeFieldName(type)} is required` })
		.min(8, `${humanizeFieldName(type)} must be atleast 8 characters`)
		.max(32, `${humanizeFieldName(type)} can not exceed 32 characters`);

export const getEmailSchema = () =>
	string({ required_error: 'Email is required' }).min(1, 'Email is required').email('Invalid email');

export const getNameSchema = () =>
	string({ required_error: 'Name is required' })
		.min(1, 'Name is required')
		.max(50, 'Name must be less than 50 characters');

export const getTitleSchema = () =>
	string({ required_error: 'Title is required' })
		.min(3, { message: 'Title must be atleast 3 characters long' })
		.max(100, { message: 'Title must be at most 100 characters' });

export const getTextAreaSchema = (type: 'Description' | 'Justification') =>
	string({ required_error: `${type} is required` }).min(10, { message: `${type} must have atleast 10 characters` });

export const getBudgetSchema = () => number().min(100, { message: 'Budget must be at least ₱100' });

export const getUuidSchema = () => string().uuid({ message: 'A valid ID must be selected.' });
