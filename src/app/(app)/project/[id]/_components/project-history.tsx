'use client';

import { useGetProjectHistory } from '@/hooks/use-project';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, GitBranch, Play, Plus, RefreshCw, Timer, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

function getHistoryIcon(title: string, subtitle = '') {
	const text = `${title} ${subtitle}`.toLowerCase();

	if (text.includes('created')) return Plus;
	if (text.includes('completed')) return CheckCircle;
	if (text.includes('approved')) return CheckCircle;
	if (text.includes('rejected')) return XCircle;
	if (text.includes('revision') || text.includes('revised')) return GitBranch;
	if (text.includes('ongoing')) return Play;
	if (text.includes('highrisk') || text.includes('high risk')) return AlertTriangle;
	if (text.includes('pending')) return Timer;
	if (text.includes('updated')) return RefreshCw;
	return Clock;
}

function getHistoryColor(title: string, subtitle = '') {
	const text = `${title} ${subtitle}`.toLowerCase();

	if (text.includes('created')) return 'bg-green-500 dark:bg-green-600';
	if (text.includes('completed')) return 'bg-emerald-500 dark:bg-emerald-600';
	if (text.includes('approved')) return 'bg-green-600 dark:bg-green-700';
	if (text.includes('rejected')) return 'bg-red-500 dark:bg-red-600';
	if (text.includes('revision') || text.includes('revised')) return 'bg-orange-500 dark:bg-orange-600';
	if (text.includes('ongoing')) return 'bg-blue-500 dark:bg-blue-600';
	if (text.includes('highrisk') || text.includes('high risk')) return 'bg-red-600 dark:bg-red-700';
	if (text.includes('pending')) return 'bg-yellow-500 dark:bg-yellow-600';
	if (text.includes('updated')) return 'bg-blue-400 dark:bg-blue-500';
	return 'bg-gray-500 dark:bg-gray-600';
}

export function ProjectHistory({ id }: { id: string }) {
	const { data } = useGetProjectHistory({ id: id as string });

	if (!data || data.length === 0) {
		return (
			<div className="space-y-4">
				<Card className="dark:bg-card dark:border-border">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div className="flex items-center gap-2">
							<Clock className="w-5 h-5" />
							<h3 className="text-lg font-semibold">Project History</h3>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8 text-muted-foreground">
							<Clock className="w-8 h-8 mx-auto mb-2 opacity-50 dark:opacity-40" />
							<p>No project history available</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card className="dark:bg-card dark:border-border">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="flex items-center gap-2">
						<Clock className="w-5 h-5" />
						<h3 className="text-lg font-semibold">Project History</h3>
						<Badge variant="secondary" className="dark:bg-secondary dark:text-secondary-foreground">
							{data.length} {data.length === 1 ? 'event' : 'events'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-6 top-0 bottom-0 w-px bg-border dark:bg-border" />

						<div className="space-y-6">
							{data.map((historyItem) => {
								const Icon = getHistoryIcon(historyItem.title, historyItem.subtitle);
								const colorClass = getHistoryColor(historyItem.title, historyItem.subtitle);

								return (
									<div key={historyItem.id} className="relative flex items-start gap-4">
										<div
											className={`relative z-10 flex items-center justify-center w-12  h-12 rounded-full ${colorClass} shadow-lg dark:shadow-xl`}
										>
											<Icon className="w-5 h-5 text-white" />
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<Card className="shadow-sm dark:shadow-md dark:bg-card dark:border-border">
												<CardContent className="p-4">
													<div className="flex items-start justify-between gap-4">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<h4 className="font-semibold text-foreground dark:text-foreground">
																	{historyItem.title}
																</h4>
															</div>
															<p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">
																{historyItem.subtitle}
															</p>
															<div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
																<Clock className="w-3 h-3" />
																<div>{formatDate(historyItem.createdAt)}</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
