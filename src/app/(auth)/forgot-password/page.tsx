'use client';

import { LoadingButton } from '@/components/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { forgetPassword } from '@/lib/auth-client';
import { ForgotPasswordSchema, forgotPasswordSchema } from '@/lib/zod/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function Page() {
	const [pending, setPending] = useState(false);
	const form = useForm<ForgotPasswordSchema>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async ({ email }: ForgotPasswordSchema) => {
		try {
			setPending(true);
			const { data, error } = await forgetPassword({
				email,
				redirectTo: '/reset-password',
			});
			if (data?.status) {
				toast.success('Forgot password request successful', {
					description: 'If an account exists with this email, you will receive a password reset link.',
				});
			}
			if (error) {
				toast.error('Forgot password request unsuccessful', {
					description: error.message,
				});
			}
		} catch (error) {
			toast.error('Something went wrong.', { description: `${error}` });
		} finally {
			setPending(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="flex flex-col items-center text-center">
				<CardTitle className="text-3xl font-bold tracking-tight">Forgot Password</CardTitle>
				<CardDescription className="text-balance text-muted-foreground">Enter your email to continue</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Enter your email" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<LoadingButton pending={pending}>Reset Password</LoadingButton>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
