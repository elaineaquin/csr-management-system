'use client';

import { LoadingButton } from '@/components/loading-button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	CardAction,
} from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/lib/auth-client';
import { humanizeFieldName } from '@/lib/utils';
import { ChangePasswordSchema, changePasswordSchema } from '@/lib/zod/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function ChangePassword() {
	const [pending, setPending] = useState(false);
	const form = useForm<ChangePasswordSchema>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
		},
	});

	const onSubmit = async (data: ChangePasswordSchema) => {
		setPending(true);
		await changePassword(
			{ ...data, revokeOtherSessions: true },
			{
				onSuccess: () => {
					toast.success('Password changed successfully');
				},
				onError: (ctx) => {
					toast.error('Something went wrong', {
						description: ctx.error.message,
					});
				},
			},
		);
		setPending(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Password</CardTitle>
				<CardDescription>Set your new password</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6">
						{['currentPassword', 'newPassword'].map((field) => (
							<FormField
								key={field}
								control={form.control}
								name={field as keyof ChangePasswordSchema}
								render={({ field: fieldProps }) => (
									<FormItem>
										<FormLabel>{humanizeFieldName(field)}</FormLabel>
										<FormControl>
											<Input type="password" placeholder={`Enter your ${humanizeFieldName(field)}`} {...fieldProps} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex flex-col items-start space-y-2">
				<CardAction>
					<LoadingButton pending={pending} type="button" onClick={form.handleSubmit(onSubmit)}>
						Change Password
					</LoadingButton>
				</CardAction>
				<p className="text-sm text-muted-foreground text-left">
					Changing password will revoke all other sessions and sign you out from all other devices.
				</p>
			</CardFooter>
		</Card>
	);
}
