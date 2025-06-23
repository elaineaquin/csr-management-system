'use client';

import { FaChrome, FaGithub } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInSchema, SignInSchema } from '@/lib/zod/auth.schema';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/loading-button';
import { signIn } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignInPage() {
	// states
	const [emailPending, setEmailPending] = useState(false);
	const [githubPending, setGithubPending] = useState(false);
	const [googlePending, setGooglePending] = useState(false);
	// const [microsoftPending, setMicrosoftPending] = useState(false);

	// hooks
	const searchParams = useSearchParams();
	const error = searchParams.get('error');
	const form = useForm<SignInSchema>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: '', password: '', rememberMe: false },
	});

	useEffect(() => {
		if (error === 'signup_disabled') {
			form.setError('root', {
				message: `This account isn't registered yet. You can link it from your account settings after signing in with email.`,
			});
		} else if (error === 'account_not_linked') {
			form.setError('root', {
				message: `This social account isn't linked to your profile. Please sign in with your email first, then link it from your account settings.`,
			});
		}
	}, [error, form]);

	// handlers
	const onSubmit = async (data: SignInSchema) => {
		setEmailPending(true);
		try {
			await signIn.email(
				{ ...data, callbackURL: '/dashboard' },
				{
					onError: (ctx) => {
						toast.error('Something went wrong', { description: ctx.error.message });
					},
				},
			);
		} catch (error) {
			console.error(error);
		} finally {
			setEmailPending(false);
		}
	};

	const onSigninWithGithub = async () => {
		setGithubPending(true);
		try {
			await signIn.social(
				{ provider: 'github', errorCallbackURL: '/sign-in', callbackURL: '/dashboard' },
				{
					onError: (ctx) => {
						toast.error('Something went wrong', { description: ctx.error.message });
					},
				},
			);
		} catch (error) {
			toast.error('Something went wrong', { description: JSON.stringify(error) });
		} finally {
			setGithubPending(false);
		}
	};

	const onSigninWithGoogle = async () => {
		setGooglePending(true);
		try {
			await signIn.social(
				{ provider: 'google', errorCallbackURL: '/sign-in', callbackURL: '/dashboard' },
				{
					onError: (ctx) => {
						toast.error('Something went wrong', { description: ctx.error.message });
					},
				},
			);
		} catch (error) {
			toast.error('Something went wrong', { description: JSON.stringify(error) });
		} finally {
			setGooglePending(false);
		}
	};

	// const onSigninWithMicrosoft = async () => {
	// 	setMicrosoftPending(true);
	// 	try {
	// 		await signIn.social(
	// 			{ provider: 'microsoft', errorCallbackURL: '/sign-in', callbackURL: '/dashboard' },
	// 			{
	// 				onError: (ctx) => {
	// 					toast.error('Something went wrong', { description: ctx.error.message });
	// 				},
	// 			},
	// 		);
	// 	} catch (error) {
	// 		toast.error('Something went wrong', { description: JSON.stringify(error) });
	// 	} finally {
	// 		setMicrosoftPending(false);
	// 	}
	// };

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="flex flex-col items-center text-center">
				<CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
				<CardDescription className="text-balance text-muted-foreground">
					Login to your account to continue
				</CardDescription>
				{form.formState.errors.root && (
					<Alert variant="destructive" className="border-destructive bg-destructive/10 mt-4">
						<AlertCircleIcon className="h-4 w-4" />
						<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
					</Alert>
				)}
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 gap-3">
					<LoadingButton pending={githubPending} onClick={onSigninWithGithub} type="button" variant={'outline'}>
						<FaGithub /> Sign in with Github
					</LoadingButton>
					<LoadingButton pending={googlePending} onClick={onSigninWithGoogle} type="button" variant={'outline'}>
						<FaChrome /> Sign in with Gmail
					</LoadingButton>
					{/* <LoadingButton pending={microsoftPending} onClick={onSigninWithMicrosoft} type="button" variant={'outline'}>
						<FaMicrosoft /> Sign in with Microsoft
					</LoadingButton> */}
				</div>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t "></div>
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="px-2 text-muted-foreground bg-card">Or login with email</span>
					</div>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name={'email'}
							render={({ field: fieldProps }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Email</FormLabel>
									</div>
									<FormControl>
										<Input type="email" placeholder={`Enter your Email`} {...fieldProps} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={'password'}
							render={({ field: fieldProps }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Password</FormLabel>
										<Link href={'/forgot-password'} className="text-sm text-primary hover:underline">
											Forgot Password?
										</Link>
									</div>
									<FormControl>
										<Input type="password" placeholder={`Enter your Password`} {...fieldProps} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={'rememberMe'}
							render={({ field: fieldProps }) => (
								<FormItem className="flex items-center gap-2">
									<FormControl>
										<Checkbox checked={fieldProps.value} onCheckedChange={fieldProps.onChange} />
									</FormControl>
									<FormLabel>Remember me</FormLabel>
								</FormItem>
							)}
						/>
						<LoadingButton pending={emailPending}>Log In</LoadingButton>
					</form>
				</Form>
				<Button className="w-full text-primary" variant="link" asChild>
					<Link href={'/sign-up'}>Does not have an account? Sign up here.</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
