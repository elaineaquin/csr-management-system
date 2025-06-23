import { Loader2 } from 'lucide-react';

export function Loading() {
	return (
		<div className="flex items-center justify-center h-[500px]">
			<Loader2 className="w-10 h-10 animate-spin" />
		</div>
	);
}
