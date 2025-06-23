'use client';

import { LoadingButton } from '@/components/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { humanizeFieldName } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getInputType } from '@/lib/utils';
import { signUpSchema, SignUpSchema } from '@/lib/zod/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';

export default function SignUpPage() {
	const [pending, setPending] = useState(false);
	const form = useForm<SignUpSchema>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { email: '', password: '', confirmPassword: '', name: '' },
	});

	const onSubmit = async (data: SignUpSchema) => {
		setPending(true);
		try {
			await signUp.email(
				{ ...data },
				{
					onSuccess: () => {
						toast.success('Account Created successfully', {
							description: 'Check your email for a verification link.',
						});
						form.reset();
					},
					onError: (ctx) => {
						toast.error('Something went wrong', { description: ctx.error.message });
					},
				},
			);
		} catch (error) {
			console.error(error);
		} finally {
			setPending(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="flex flex-col items-center text-center">
				<CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
				<CardDescription className="text-balance text-muted-foreground">
					Register to your account to continue
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{['name', 'email', 'password', 'confirmPassword'].map((field) => (
							<FormField
								key={field}
								control={form.control}
								name={field as keyof SignUpSchema}
								render={({ field: fieldProps }) => (
									<FormItem>
										<FormLabel>{humanizeFieldName(field)}</FormLabel>
										<FormControl>
											<Input
												type={getInputType(field)}
												placeholder={`Enter your ${humanizeFieldName(field)}`}
												{...fieldProps}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<LoadingButton pending={pending}>Sign Up</LoadingButton>
					</form>
				</Form>
				<Button className="w-full text-primary" variant="link" asChild>
					<Link href="/sign-in">Already have an account? Sign in</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
