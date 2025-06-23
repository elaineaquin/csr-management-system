import { NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';
import prisma from '@/lib/prisma';

const cohere = new CohereClient({
	token: process.env.COHERE_API_KEY!,
});

export async function GET() {
	try {
		// Step 1: Fetch all projects with fund requests
		const projects = await prisma.project.findMany({
			include: {
				fundRequests: true,
			},
		});

		// Step 2: Build AnalysisData format
		const projectData = projects.map((project) => {
			const duration = (new Date(project.to).getTime() - new Date(project.from).getTime()) / (1000 * 60 * 60 * 24); // in days

			const totalRequested = project.fundRequests.reduce((sum, fr) => sum + fr.amount, 0);
			const releasedAmount = project.fundRequests
				.filter((fr) => fr.status === 'Released')
				.reduce((sum, fr) => sum + fr.amount, 0);
			const pendingAmount = project.fundRequests
				.filter((fr) => fr.status === 'Pending')
				.reduce((sum, fr) => sum + fr.amount, 0);

			const categoryBreakdown: Record<string, number> = {};
			for (const fr of project.fundRequests) {
				categoryBreakdown[fr.category] = (categoryBreakdown[fr.category] || 0) + fr.amount;
			}

			return {
				title: project.title,
				budget: project.budget,
				status: project.status,
				needsAttention: project.needsAttention,
				duration: Math.round(duration),
				totalRequested,
				releasedAmount,
				pendingAmount,
				categoryBreakdown,
			};
		});

		const totalMetrics = {
			totalBudget: projectData.reduce((sum, p) => sum + p.budget, 0),
			totalRequested: projectData.reduce((sum, p) => sum + p.totalRequested, 0),
			totalReleased: projectData.reduce((sum, p) => sum + p.releasedAmount, 0),
			totalPending: projectData.reduce((sum, p) => sum + p.pendingAmount, 0),
		};

		const analysisData = {
			projects: projectData,
			totalMetrics,
		};

		// Step 3: Create AI prompt
		const prompt = `
You are a financial analyst specializing in CSR project management.
Analyze the following financial and operational project data and return 3–5 specific recommendations in strict JSON format.

Project Data:
${JSON.stringify(analysisData, null, 2)}

JSON Response Format:
{
  "recommendations": [
    {
      "type": "budget_optimization" | "risk_alert" | "opportunity" | "efficiency",
      "title": "Brief title",
      "description": "Detailed description with specific numbers and actionable advice",
      "impact": "high" | "medium" | "low",
      "confidence": number (0-100),
      "actionable": boolean
    }
  ]
}

Focus areas:
- Budget utilization and optimization
- Overspending or underutilization risks
- Delayed fund releases
- Seasonal/project timing insights
- Opportunities for resource efficiency

Respond ONLY in valid JSON format.
`;

		const chat = await cohere.chat({
			model: 'command',
			message: prompt,
		});

		let recommendations;
		try {
			const parsed = JSON.parse(chat.text);
			recommendations = parsed.recommendations || [];
		} catch (error) {
			console.error('AI response parsing error:', error);
			recommendations = [
				{
					type: 'risk_alert',
					title: 'Invalid AI Response',
					description: 'Unable to parse recommendations from AI. Please try again later.',
					impact: 'low',
					confidence: 0,
					actionable: false,
				},
			];
		}

		return NextResponse.json(recommendations);
	} catch (err) {
		console.error('Error generating forecast:', err);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
