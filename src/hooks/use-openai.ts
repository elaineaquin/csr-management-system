import { useQuery } from '@tanstack/react-query';

export function useOpenAI() {
	return useQuery<
		{
			type: string;
			title: string;
			description: string;
			impact: string;
			confidence: number;
			actionable: boolean;
		}[]
	>({
		queryKey: ['openai'],
		queryFn: async () => {
			const response = await fetch('/api/cohere');
			if (!response.ok) {
				throw new Error('Failed to fetch OpenAI data');
			}
			return response.json();
		},
	});
}

// const mockData = [
// 	{
// 		type: 'budget_optimization',
// 		title: 'Optimize Project Budgets',
// 		description:
// 			'While the individual project budgets appear adequate, there is an opportunity to optimize overall funding allocation across projects. Consider redistributing funds between projects or categories to align with current priorities, or to meet evolving societal needs.',
// 		impact: 'high',
// 		confidence: 100,
// 		actionable: true,
// 	},
// 	{
// 		type: 'risk_alert',
// 		title: 'Potential Delayed Funding',
// 		description:
// 			'One project (`CSR Project Completions`) has a requested budget of $500, but no funds have been released yet. Delayed funding may result in project delays, so it requires attention from management to ensure smooth project progression.',
// 		impact: 'high',
// 		confidence: 100,
// 		actionable: true,
// 	},
// 	{
// 		type: 'efficiency',
// 		title: 'Consider Unallocated Funds',
// 		description:
// 			'One project has a budget of $100 but no funds have been requested. This may indicate the project is either complete or redundant, both of which warrant investigation.',
// 		impact: 'medium',
// 		confidence: 67,
// 		actionable: true,
// 	},
// ];
