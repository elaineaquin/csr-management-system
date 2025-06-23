import { Card, CardContent } from '@/components/ui/card';
import { FileText, Target, Users, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { FundRequestHistoryData } from '@/types/fund-request.types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface FundRequestHistoryPreviewProps {
	data: FundRequestHistoryData;
}
export function FundRequestHistoryPreview({ data }: FundRequestHistoryPreviewProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Projects</p>
								<p className="text-2xl font-bold text-blue-900 dark:text-white">{data.total}</p>
							</div>
							<FileText className="w-8 h-8 text-blue-500 dark:text-blue-300" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 dark:text-green-300">Total Budget</p>
								<p className="text-2xl font-bold text-green-900 dark:text-white">
									{formatCurrency(data.histories.reduce((sum, h) => sum + h.budget, 0))}
								</p>
							</div>
							<Target className="w-8 h-8 text-green-500 dark:text-green-300" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900 dark:to-purple-800 dark:border-purple-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600 dark:text-purple-300">Fund Requests</p>
								<p className="text-2xl font-bold text-purple-900 dark:text-white">
									{data.histories.reduce((sum, h) => sum + h.fundRequests.length, 0)}
								</p>
							</div>
							<Users className="w-8 h-8 text-purple-500 dark:text-purple-300" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900 dark:to-orange-800 dark:border-orange-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-orange-600 dark:text-orange-300">Approved Rate</p>
								<p className="text-2xl font-bold text-orange-900 dark:text-white">
									{Math.round((data.histories.filter((h) => h.status === 'approved').length / data.total) * 100)}%
								</p>
							</div>
							<BarChart2 className="w-8 h-8 text-orange-500 dark:text-orange-300" />
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="flex items-center justify-between">
				<h3 className="text-xl font-bold dark:text-white">Project Details</h3>
				<Badge variant="outline" className="text-sm">
					{data.histories.length} {data.histories.length === 1 ? 'Project' : 'Projects'}
				</Badge>
			</div>

			{data.histories.map((history) => (
				<Card key={history.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-slate-800">
					<CardContent className="p-0">
						<div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b dark:from-slate-700 dark:to-slate-800 dark:border-slate-600">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h4 className="text-lg font-semibold text-slate-900 dark:text-white">{history.title}</h4>
									<p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
										{format(new Date(history.from), 'MMM dd')} - {format(new Date(history.to), 'MMM dd, yyyy')}
									</p>
								</div>
								<div className="text-right">
									<Badge
										variant={
											history.status === 'approved'
												? 'default'
												: history.status === 'pending'
												? 'secondary'
												: 'destructive'
										}
										className="mb-2"
									>
										{history.status.charAt(0).toUpperCase() + history.status.slice(1)}
									</Badge>
									{history.needsAttention && (
										<Badge
											variant="outline"
											className="ml-2 text-amber-600 border-amber-600 dark:text-amber-300 dark:border-amber-300"
										>
											Needs Attention
										</Badge>
									)}
								</div>
							</div>
						</div>

						<div className="p-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<p className="text-sm font-medium text-slate-600 dark:text-slate-300">Budget Allocation</p>
									<p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(history.budget)}</p>
									<div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full"
											style={{
												width: `${Math.min(
													(history.fundRequests.reduce((sum, fr) => sum + fr.amount, 0) / history.budget) * 100,
													100,
												)}%`,
											}}
										></div>
									</div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{formatCurrency(history.fundRequests.reduce((sum, fr) => sum + fr.amount, 0))} utilized
									</p>
								</div>

								<div className="space-y-2 col-span-2">
									<div>
										<p className="text-sm font-medium text-slate-600 dark:text-slate-300">Fund Requests</p>
										<div className="space-y-1">
											{history.fundRequests.map((fr) => (
												<div key={fr.id}>
													<div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
														<div>
															<p className="text-sm font-medium dark:text-white">{fr.category}</p>
															<p className="text-xs text-slate-500 dark:text-slate-400">Ref: {fr.referenceNumber}</p>
														</div>
														<div className="text-right">
															<p className="text-sm font-semibold dark:text-white">{formatCurrency(fr.amount)}</p>
															<Badge variant={fr.status === 'released' ? 'default' : 'secondary'}>{fr.status}</Badge>
														</div>
														<div className="flex items-end flex-col justify-end">
															<div className="flex items-center text-sm">
																<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
																<span className="text-slate-600 dark:text-slate-400">
																	Requested: {format(new Date(fr.createdAt), 'MMM dd, yyyy')}
																</span>
															</div>
															<div className="flex items-center text-sm">
																<div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
																<span className="text-slate-600 dark:text-slate-400">
																	Released: {fr.releaseDate ? format(new Date(fr.releaseDate), 'MMM dd, yyyy') : 'N/A'}
																</span>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
