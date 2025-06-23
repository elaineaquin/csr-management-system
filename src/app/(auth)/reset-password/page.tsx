'use client';

import { LoadingButton } from '@/components/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/auth-client';
import { getInputType, humanizeFieldName } from '@/lib/utils';
import { ResetPasswordSchema, resetPasswordSchema } from '@/lib/zod/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function Page() {
	const [pending, setPending] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get('error');
	const token = searchParams.get('token') ?? '';
	const form = useForm<ResetPasswordSchema>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});
	const onSubmit = async ({ password }: ResetPasswordSchema) => {
		try {
			setPending(true);
			const { data, error } = await resetPassword({
				newPassword: password,
				token,
			});
			if (data?.status) {
				toast.success('Password reset successful', {
					description: 'Login to continue',
				});
				router.push('/sign-in');
			}

			if (error) {
				toast.error('Password reset unsuccessful', {
					description: error.message,
				});
			}
		} catch (error) {
			toast.error('Something went wrong.', {
				description: `${error}`,
			});
		} finally {
			setPending(false);
		}
	};

	if (error === 'invalid_token') {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="flex flex-col items-center text-center">
					<CardTitle className="text-3xl font-bold tracking-tight">Invalid Reset Link</CardTitle>
					<CardDescription className="text-balance text-muted-foreground">
						This password reset link is invalid or has expired.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="flex flex-col items-center text-center">
				<CardTitle className="text-3xl font-bold tracking-tight">Change Password</CardTitle>
				<CardDescription className="text-balance text-muted-foreground">Enter new password to change</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{['password', 'confirmPassword'].map((field) => (
							<FormField
								key={field}
								control={form.control}
								name={field as keyof ResetPasswordSchema}
								render={({ field: fieldProps }) => (
									<FormItem>
										<FormItem>
											<FormLabel>{humanizeFieldName(field)}</FormLabel>
											<FormControl>
												<Input
													type={getInputType(field)}
													placeholder={`Enter your ${humanizeFieldName(field)}`}
													{...fieldProps}
												/>
											</FormControl>
										</FormItem>
									</FormItem>
								)}
							/>
						))}
						<LoadingButton pending={pending}>Submit</LoadingButton>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
