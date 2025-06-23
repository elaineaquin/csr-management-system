import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TerminalIcon } from 'lucide-react';

export function PublicProfile() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Update your profile information visible to other users.</CardDescription>
			</CardHeader>
			<CardContent>
				<Alert>
					<TerminalIcon className="h-4 w-4" />
					<AlertTitle>On Development</AlertTitle>
					<AlertDescription>This feature is in development</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
