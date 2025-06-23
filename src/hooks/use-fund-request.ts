'use client';

import { FundRequestStatusType, Prisma } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSendBroadcastNotification, useSendNotification } from './use-notification';
import { useSession } from '@/lib/auth-client';
import {
	createFundRequest,
	deleteFundRequest,
	getApprovalTurnAroundTime,
	getExpensesSummary,
	getFinancialOverview,
	getFundRequestById,
	getFundRequestHistory,
	getFundRequests,
	updateFundRequest,
} from '@/server/fund-request';

export function useCreateFundRequest() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { mutate: sendBroadcastNotification } = useSendBroadcastNotification();
	return useMutation({
		mutationKey: ['create-fund-request'],
		mutationFn: async (data: Prisma.FundRequestCreateInput) => {
			return await createFundRequest(data);
		},
		onSuccess: async (data) => {
			toast.success('Fund Request created', {
				description:
					"Your fund request has been successfully submitted and is now under review. You'll receive a notification once it's approved.",
			});
			sendBroadcastNotification({
				link: `/finance/${data.id}`,
				roles: ['admin', 'u3'], // u3 finance team
				message: `A new fund request has been submitted and is under review`,
			});
			await queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
			router.push('/finance');
		},
	});
}

export function useGetFundRequests(params: {
	title?: string;
	userId?: string;
	recent?: boolean;
	status?: FundRequestStatusType;
}) {
	return useQuery({
		queryKey: ['fund-requests', params],
		queryFn: async () => {
			const title = params.title || '';
			const userId = params.userId || undefined;
			const recent = params.recent || false;
			const status = params.status || undefined;
			return await getFundRequests({ title, userId, recent, status });
		},
	});
}

export function useGetFinancialOverview() {
	return useQuery({
		queryKey: ['financial-overview'],
		queryFn: async () => {
			return await getFinancialOverview();
		},
	});
}

export function useGetFundRequestById(params: { id: string }) {
	return useQuery({
		queryKey: ['fund-request', params],
		queryFn: async () => {
			return await getFundRequestById(params);
		},
	});
}

export function useUpdateFundStatus() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { mutateAsync: sendNotification } = useSendNotification();

	return useMutation({
		mutationKey: ['update-fund-status'],
		mutationFn: async (params: { id: string; data: Prisma.FundRequestUpdateInput }) => {
			const { id, data } = params;
			return await updateFundRequest(id, data);
		},
		onSuccess: async (data) => {
			queryClient.invalidateQueries({ queryKey: ['fund-requests'] });
			await sendNotification({
				link: `/finance/${data.id}`,
				user: {
					connect: {
						id: data.createdById,
					},
				},
				message: `Fund request for project "${data.project}" has been ${data.status} by ${session?.user.name}`,
			});
		},
	});
}

export function useDeleteFundRequest() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { mutateAsync: sendNotification } = useSendNotification();
	return useMutation({
		mutationKey: ['delete-fund-request'],
		mutationFn: async (params: { id: string }) => {
			const fundRequest = await getFundRequestById(params);
			await deleteFundRequest(params);
			return fundRequest;
		},
		onSuccess: async (data) => {
			toast.success('Fund Request deleted', {
				description: `Fund request for project "${data.project}" has been deleted by ${session?.user.name}`,
			});
			queryClient.invalidateQueries({ queryKey: ['fund-requests'] });
			await sendNotification({
				user: {
					connect: {
						id: data.createdById,
					},
				},
				message: `Your fund request for project "${data.project}" has been deleted by ${session?.user.name}`,
			});
		},
	});
}

export function useAddDocumentToFundRequest() {
	return useMutation({
		mutationKey: ['add-document-to-fund-request'],
		mutationFn: async (params: { id: string; data: Prisma.FundRequestUpdateInput }) => {
			const { id, data } = params;
			return await updateFundRequest(id, data);
		},
		onSuccess: async () => {
			toast.success('Documents added successfully');
		},
	});
}

export function useGetFundRequestHistory(params: { from: Date; to: Date }) {
	return useQuery({
		queryKey: ['fund-request-history', params],
		queryFn: () => getFundRequestHistory(params),
		enabled: false,
		gcTime: 0,
		staleTime: 0,
	});
}

export function useGetFundRequestExpensesSummary(params: { from: Date; to: Date }) {
	return useQuery({
		queryKey: ['fund-request-expenses-summary', params],
		queryFn: () => getExpensesSummary(params),
		enabled: false,
		gcTime: 0,
		staleTime: 0,
	});
}

export function useGetFundRequestApprovalTurnAround(params: { from: Date; to: Date }) {
	return useQuery({
		queryKey: ['fund-request-approval-turn-around', params],
		queryFn: () => getApprovalTurnAroundTime(params),
		enabled: false,
		gcTime: 0,
		staleTime: 0,
	});
}
