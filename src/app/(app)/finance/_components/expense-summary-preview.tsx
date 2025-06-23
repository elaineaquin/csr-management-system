import { Card, CardContent } from '@/components/ui/card';
import { ExpenseCategorySummary } from '@/types/fund-request.types';
import { BarChart2, FileText, Target } from 'lucide-react';

interface ExpenseSummaryPreviewProps {
	data: ExpenseCategorySummary[];
}

export function ExpenseSummaryPreview({ data }: ExpenseSummaryPreviewProps) {
	const totalExpenses = data.reduce((sum, item) => sum + item.total, 0);
	const totalCount = data.reduce((sum, item) => sum + item.count, 0);

	const colors = [
		'from-blue-500 to-blue-600',
		'from-green-500 to-green-600',
		'from-purple-500 to-purple-600',
		'from-orange-500 to-orange-600',
		'from-pink-500 to-pink-600',
	];

	const bgColors = [
		'from-blue-50 to-blue-100 border-blue-200',
		'from-green-50 to-green-100 border-green-200',
		'from-purple-50 to-purple-100 border-purple-200',
		'from-orange-50 to-orange-100 border-orange-200',
		'from-pink-50 to-pink-100 border-pink-200',
	];

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-emerald-600">Total Expenses</p>
								<p className="text-2xl font-bold text-emerald-900">₱{totalExpenses.toLocaleString()}</p>
							</div>
							<BarChart2 className="w-8 h-8 text-emerald-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600">Total Requests</p>
								<p className="text-2xl font-bold text-blue-900">{totalCount}</p>
							</div>
							<FileText className="w-8 h-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600">Categories</p>
								<p className="text-2xl font-bold text-purple-900">{data.length}</p>
							</div>
							<Target className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Category Breakdown */}
			<div className="space-y-4">
				<h3 className="text-xl font-bold">Expense Breakdown by Category</h3>

				{data.map((item, index) => {
					const percentage = (item.total / totalExpenses) * 100;

					return (
						<Card key={index} className={`bg-gradient-to-r ${bgColors[index % bgColors.length]} overflow-hidden`}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-lg font-semibold">{item.category}</h4>
									<div className="text-right">
										<p className="text-2xl font-bold">₱{item.total.toLocaleString()}</p>
										<p className="text-sm text-slate-600">{percentage.toFixed(1)}% of total</p>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
									<div className="text-center p-3 bg-white/50 rounded-lg">
										<p className="text-2xl font-bold text-amber-600">{item.Pending}</p>
										<p className="text-xs text-slate-600">Pending</p>
									</div>
									<div className="text-center p-3 bg-white/50 rounded-lg">
										<p className="text-2xl font-bold text-blue-600">{item.Approved}</p>
										<p className="text-xs text-slate-600">Approved</p>
									</div>
									<div className="text-center p-3 bg-white/50 rounded-lg">
										<p className="text-2xl font-bold text-red-600">{item.Rejected}</p>
										<p className="text-xs text-slate-600">Rejected</p>
									</div>
									<div className="text-center p-3 bg-white/50 rounded-lg">
										<p className="text-2xl font-bold text-green-600">{item.Released}</p>
										<p className="text-xs text-slate-600">Released</p>
									</div>
								</div>

								<div className="w-full bg-white/30 rounded-full h-3">
									<div
										className={`bg-gradient-to-r ${
											colors[index % colors.length]
										} h-3 rounded-full transition-all duration-500`}
										style={{ width: `${percentage}%` }}
									></div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
