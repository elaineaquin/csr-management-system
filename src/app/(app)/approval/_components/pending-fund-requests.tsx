'use client';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export function PendingFundRequests() {
	return (
		<Alert>
			<AlertCircleIcon />
			<AlertTitle>Work on Progress</AlertTitle>
		</Alert>
	);
}
