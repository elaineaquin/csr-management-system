import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOpenAI } from '@/hooks/use-openai';
import { AlertTriangle, Brain, DollarSign, Target, TrendingUp } from 'lucide-react';

export function FinanceForecast() {
	const { data, isLoading } = useOpenAI();

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'budget_optimization':
				return <DollarSign className="h-4 w-4" />;
			case 'risk_alert':
				return <AlertTriangle className="h-4 w-4" />;
			case 'opportunity':
				return <Target className="h-4 w-4" />;
			case 'efficiency':
				return <TrendingUp className="h-4 w-4" />;
			default:
				return <Brain className="h-4 w-4" />;
		}
	};
	const getImpactColor = (impact: string) => {
		switch (impact) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'low':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	if (isLoading || !data) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardContent className="p-4">
							<div className="flex items-start gap-4">
								<Skeleton className="h-10 w-10 rounded" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-3 w-2/3" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{data.map((recommendation, index) => (
				<Alert key={index} className="flex gap-4 items-start">
					<div className="mt-1">{getTypeIcon(recommendation.type)}</div>
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<AlertTitle>{recommendation.title}</AlertTitle>
							<Badge className={getImpactColor(recommendation.impact)}>{recommendation.impact} impact</Badge>
							<Badge variant="outline">{recommendation.confidence}% confidence</Badge>
						</div>
						<AlertDescription>{recommendation.description}</AlertDescription>
						{/* {recommendation.actionable && (
							<div className="mt-3">
								<Button size="sm" variant="outline">
									Apply Recommendation
								</Button>
							</div>
						)} */}
					</div>
				</Alert>
			))}
		</div>
	);
}
