'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { updateUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SettingsPage() {
	const { theme, setTheme } = useTheme();
	const [currentTheme, setCurrentTheme] = useState(theme ?? 'system');

	const handleChangeTheme = async (newTheme: string) => {
		try {
			setTheme(newTheme);
			setCurrentTheme(newTheme);
			await updateUser(
				{ theme: newTheme },
				{
					onSuccess: () => {
						toast.success('Preference saved');
					},
				},
			);
		} catch (err) {
			toast.error('Something went wrong', { description: `${err}` });
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Preferences</CardTitle>
				<CardDescription>Select your preferred theme code</CardDescription>
				<CardAction>
					<Select value={currentTheme} onValueChange={handleChangeTheme}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select Mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="light">Light</SelectItem>
							<SelectItem value="dark">Dark</SelectItem>
							<SelectItem value="system">System</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
		</Card>
	);
}
