import getOpenAIClient from '@/lib/openai-client';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
	const openai = getOpenAIClient();

	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content: 'You are a helpful assistant.',
			},
		],
		stream: true,
		temperature: 1,
	});
	return NextResponse.json(response);
}
