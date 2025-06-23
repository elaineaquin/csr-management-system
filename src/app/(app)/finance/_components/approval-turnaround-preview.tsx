import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock3, Target, Users } from 'lucide-react';

interface ApprovalTurnaroundPreviewProps {
	data: {
		averageTurnaroundHours: number;
		totalRequests: number;
		details: {
			id: string;
			turnaroundHours: number;
		}[];
	};
}

export function ApprovalTurnaroundPreview({ data }: ApprovalTurnaroundPreviewProps) {
	const avgHours = data.averageTurnaroundHours;
	const avgDays = avgHours / 24;
	const performance = avgHours < 24 ? 'excellent' : avgHours < 72 ? 'good' : 'needs-improvement';

	return (
		<div className="space-y-6">
			{/* Performance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
					<CardContent className="p-6">
						<div className="text-center">
							<Clock3 className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
							<p className="text-3xl font-bold text-cyan-900">{avgHours.toFixed(2)}</p>
							<p className="text-sm text-cyan-600">Average Hours</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
					<CardContent className="p-6">
						<div className="text-center">
							<Target className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
							<p className="text-3xl font-bold text-indigo-900">{avgDays.toFixed(1)}</p>
							<p className="text-sm text-indigo-600">Average Days</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
					<CardContent className="p-6">
						<div className="text-center">
							<Users className="w-12 h-12 text-violet-500 mx-auto mb-3" />
							<p className="text-3xl font-bold text-violet-900">{data.totalRequests}</p>
							<p className="text-sm text-violet-600">Total Requests</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Performance Indicator */}
			<Card>
				<CardContent className="p-6">
					<div className="text-center mb-6">
						<h3 className="text-xl font-bold mb-2">Performance Rating</h3>
						<div
							className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
								performance === 'excellent'
									? 'bg-green-100 text-green-800'
									: performance === 'good'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-red-100 text-red-800'
							}`}
						>
							{performance === 'excellent'
								? '🎉 Excellent'
								: performance === 'good'
								? '👍 Good'
								: '⚠️ Needs Improvement'}
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex justify-between text-sm">
							<span>Excellent (&lt; 24h)</span>
							<span>Good (24-72h)</span>
							<span>Needs Improvement (&gt; 72h)</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-4 relative">
							<div className="absolute inset-0 flex">
								<div className="bg-green-500 h-4 rounded-l-full" style={{ width: '33.33%' }}></div>
								<div className="bg-yellow-500 h-4" style={{ width: '33.33%' }}></div>
								<div className="bg-red-500 h-4 rounded-r-full" style={{ width: '33.33%' }}></div>
							</div>
							<div
								className="absolute top-0 w-1 h-4 bg-black"
								style={{
									left: `${Math.min(Math.max((avgHours / 168) * 100, 0), 100)}%`,
									transform: 'translateX(-50%)',
								}}
							></div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Individual Request Details */}
			{data.details && data.details.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Individual Request Turnarounds</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{data.details.map((detail, index) => (
								<div key={detail.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
									<div className="flex items-center">
										<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
											<span className="text-sm font-medium text-blue-600">{index + 1}</span>
										</div>
										<span className="text-sm font-medium">Request #{detail.id.slice(-8)}</span>
									</div>
									<div className="text-right">
										<p className="text-sm font-semibold">{detail.turnaroundHours.toFixed(2)} hours</p>
										<p className="text-xs text-slate-500">{(detail.turnaroundHours / 24).toFixed(1)} days</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
