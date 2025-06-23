import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetFinancialOverview } from '@/hooks/use-fund-request';
import { formatCurrency } from '@/lib/utils';
import CountUp from 'react-countup';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function FinancialOverview() {
	const { data } = useGetFinancialOverview();
	const [showAllProjects, setShowAllProjects] = useState(false);

	const totalBudget = data?.totalBudget ?? 0;
	const totalAllocated = data?.projectMap.reduce((acc, curr) => acc + curr.allocated, 0) ?? 0;
	const totalSpent = data?.projectMap.reduce((acc, curr) => acc + curr.spent, 0) ?? 0;
	const allocatedPercentage = Math.round((totalAllocated / totalBudget) * 100);
	const spentPercentage = Math.round((totalSpent / totalBudget) * 100);
	const displayedProjects = showAllProjects ? data?.projectMap : data?.projectMap?.slice(0, 5);

	return (
		<Tabs defaultValue="summary">
			<TabsList>
				<TabsTrigger value="summary">Summary</TabsTrigger>
				<TabsTrigger value="categories">Categories</TabsTrigger>
				<TabsTrigger value="projects">Projects</TabsTrigger>
			</TabsList>

			<TabsContent value="summary">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4">
					{/* Total Budget */}
					<div>
						<p className="text-sm font-medium text-muted-foreground">Total Budget</p>
						<p className="text-3xl font-semibold text-primary">
							<CountUp end={totalBudget} formattingFn={formatCurrency} duration={1} />
						</p>
					</div>

					{/* Total Allocated */}
					<div>
						<p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
						<p className="text-3xl font-semibold text-yellow-500 dark:text-yellow-400">
							<CountUp end={totalAllocated} formattingFn={formatCurrency} duration={1} />
						</p>
						<p className="text-sm text-muted-foreground">{allocatedPercentage}% of total budget</p>
					</div>

					{/* Total Spent */}
					<div>
						<p className="text-sm font-medium text-muted-foreground">Total Spent</p>
						<p className="text-3xl font-semibold text-green-600 dark:text-green-400">
							<CountUp end={totalSpent} formattingFn={formatCurrency} duration={1} />
						</p>
						<p className="text-sm text-muted-foreground">{spentPercentage}% of total budget</p>
					</div>
				</div>
				<div className="px-4">
					<p className="text-sm font-medium text-muted-foreground mb-1">Budget Utilization ({spentPercentage}%)</p>
					<Progress value={spentPercentage} className="h-3" />
				</div>
			</TabsContent>
			<TabsContent value="categories">
				<div className="space-y-6">
					{data?.categoryMap.length === 0 ? (
						<p className="text-sm text-muted-foreground">No categories overview available</p>
					) : (
						data?.categoryMap.map((category) => {
							return (
								<div key={category.name} className="space-y-1">
									<p className="text-sm font-medium">{category.name}</p>
									<Progress value={category.percentage} />
									<div className="flex justify-between mt-2 text-sm text-muted-foreground">
										<span>
											{formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
										</span>
										<span>{category.percentage}% Used</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</TabsContent>
			<TabsContent value="projects">
				<div className="space-y-6 p-4">
					{data?.projectMap.length === 0 ? (
						<p className="text-sm text-muted-foreground">No projects available</p>
					) : (
						<>
							<div className="space-y-4">
								{displayedProjects?.map((project) => {
									const percentage = project.allocated > 0 ? Math.round((project.spent / project.allocated) * 100) : 0;
									return (
										<div key={project.name} className="space-y-2 p-4 rounded-lg border bg-card">
											<div className="flex items-center justify-between">
												<p className="text-sm font-medium">{project.name}</p>
												<p className="text-sm text-muted-foreground">{percentage}% Used</p>
											</div>
											<Progress value={percentage} className="h-2" />
											<div className="flex justify-between mt-2 text-sm text-muted-foreground">
												<span>
													{formatCurrency(project.spent)} / {formatCurrency(project.allocated)}
												</span>
												<span>Total Budget: {formatCurrency(project.budget)}</span>
											</div>
										</div>
									);
								})}
							</div>
							{data?.projectMap && data.projectMap.length > 5 && (
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center">
										<Button
											variant="outline"
											className="bg-background hover:bg-accent"
											onClick={() => setShowAllProjects(!showAllProjects)}
										>
											{showAllProjects ? 'Show Less' : 'Show More'}
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</TabsContent>
		</Tabs>
	);
}
