import { QueryClient } from '@tanstack/react-query';

// Used for prefetching queries
let client: QueryClient | null = null;

export default function getQueryClient() {
	if (!client) {
		client = new QueryClient();
	}

	return client;
}
