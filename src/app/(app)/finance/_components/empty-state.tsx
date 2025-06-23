import { BarChart2 } from 'lucide-react';

export function EmptyState() {
	return (
		<div className="text-center py-16">
			<div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
				<BarChart2 className="w-12 h-12 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">Ready to Generate Report</h3>
			<p className="text-muted-foreground">Select your filters and click Generate Report to preview your data</p>
		</div>
	);
}
