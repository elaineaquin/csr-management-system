'use client';

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import {
	AlertCircleIcon,
	ArrowLeftIcon,
	CheckIcon,
	ClipboardCheckIcon,
	ClockIcon,
	CopyIcon,
	DollarSignIcon,
	FileTextIcon,
	FolderIcon,
	TrashIcon,
	XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { SectionWrapper } from '@/components/section-wrapper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserInfoCard } from '@/components/user-info-card';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useGetFundRequestById, useUpdateFundStatus } from '@/hooks/use-fund-request';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Checked from '@/components/checked';
import { ButtonGuard } from '@/components/button-guard';
import { useSession } from '@/lib/auth-client';

export default function FundRequestDetailsPage() {
	// hooks
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();
	const { data: fundRequest, isLoading, error, refetch } = useGetFundRequestById({ id: id as string });
	const { mutateAsync: updateFundRequest } = useUpdateFundStatus();

	// states
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');
	const isOwner = fundRequest?.createdById === session?.user.id;

	// Handle error state
	if (error) {
		return (
			<Card className="mx-auto max-w-2xl mt-8">
				<CardHeader>
					<CardTitle className="text-destructive">Error Loading Fund Request</CardTitle>
				</CardHeader>
				<CardContent>
					<p>We couldn&apos;t load the fund request details. Please try again later.</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.back()}>Go Back</Button>
					<Button variant="outline" className="ml-2" onClick={() => router.refresh()}>
						Retry
					</Button>
				</CardFooter>
			</Card>
		);
	}

	// Loading skeleton
	if (isLoading || !fundRequest) {
		return (
			<>
				<PageHeader>
					<Button variant="ghost" size="icon" className="mr-2">
						<ArrowLeftIcon />
					</Button>
					<div className="w-full">
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-96" />
					</div>
					<Skeleton className="h-6 w-24" />
				</PageHeader>

				<SectionWrapper>
					<Card>
						<CardContent className="space-y-6 pt-6">
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-3/4" />
							</div>
							<Separator />
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Separator />
							<div>
								<Skeleton className="h-6 w-32 mb-4" />
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="flex items-start space-x-2 mb-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-40" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</SectionWrapper>
			</>
		);
	}

	const onHandleRejectProposal = async () => {
		try {
			// Implement reject logic
			await updateFundRequest({
				id: fundRequest.id,
				data: {
					status: 'Rejected',
					rejectedReason: rejectionReason,
				},
			});
			setRejectionReason('');
			setRejectDialogOpen(false);
			toast.success('Fund request rejected successfully');
			refetch();
		} catch (error) {
			toast.error('Failed to reject fund request', { description: `${error}` });
		}
	};

	const onHandleApproveProposal = async () => {
		try {
			await updateFundRequest({
				id: fundRequest.id,
				data: {
					status: 'Approved',
				},
			});
			setApproveDialogOpen(false);
			toast.success('Fund request approved successfully');
			refetch();
		} catch (error) {
			toast.error('Failed to approve fund request', { description: `${error}` });
		}
	};

	// const onHandleAddDocument = async () => {
	// 	try {
	// 		await addDocumentToFundRequest({
	// 			id: fundRequest.id,
	// 			data: {
	// 				documents: {
	// 					connect: selectedDocs.map((doc) => ({ id: doc })),
	// 				},
	// 			},
	// 		});
	// 		refetch();
	// 	} catch (error) {
	// 		toast.error('Failed to add documents', { description: `${error}` });
	// 	}
	// };

	return (
		<>
			<PageHeader className="flex items-center">
				<Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
					<ArrowLeftIcon className="h-5 w-5" />
				</Button>
				<div className="flex-1 flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<PageHeaderHeading className="flex items-center gap-2">
							Fund Request Details
							{(fundRequest.status === 'approved' || fundRequest.status === 'released') && <Checked />}
						</PageHeaderHeading>
						<Badge variant="outline">{fundRequest.status}</Badge>
					</div>
					<PageHeaderDescription className="flex items-center gap-2">
						Fund Request ID: {fundRequest.id}
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4"
							onClick={() => {
								navigator.clipboard.writeText(fundRequest.id);
								toast.success('ID copied to clipboard');
							}}
						>
							<CopyIcon className="h-3 w-3" />
						</Button>
					</PageHeaderDescription>
				</div>
				<div className="flex gap-2">
					{isOwner && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" size="icon" className="text-destructive">
									<TrashIcon className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete the fund request.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => {
											// Implement delete logic
											toast.success('Fund request deleted successfully');
										}}
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			</PageHeader>
			<SectionWrapper>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
					<Card className="md:col-span-2 h-fit">
						<CardContent className="space-y-6 pt-6">
							<div className="flex items-center gap-2 mb-2">
								<FolderIcon className="h-5 w-5 text-primary" />
								<span className="font-medium">Project Details</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									<div className="text-muted-foreground">Project</div>
									<Button
										variant="link"
										className="p-0 text-sm"
										onClick={() => router.push(`/project/${fundRequest.projectId}`)}
									>
										<div className="font-semibold">{fundRequest.project ?? 'Not found'}</div>
									</Button>
								</div>
								<div className="text-sm text-right">
									<div className="text-muted-foreground">Category</div>
									<div className="font-semibold">{fundRequest.category}</div>
								</div>
							</div>
							<Separator />
							<div className="flex items-center gap-2 mb-2">
								<DollarSignIcon className="h-5 w-5" />
								<span className="font-medium">Amount Details</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									<div className="text-muted-foreground">Amount Requested</div>
									<div className="font-semibold text-xl">{formatCurrency(fundRequest.amount)}</div>
								</div>
								<div className="text-sm text-right">
									<div className="text-muted-foreground">Utilization Date</div>
									<div className="font-semibold">{format(new Date(fundRequest.createdAt), 'MMM d, yyyy')}</div>
								</div>
							</div>
							<Separator />
							<div className="flex items-center gap-2 mb-2">
								<ClockIcon className="h-5 w-5 text-primary" />
								<span className="font-medium">Status</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									<div className="text-muted-foreground">Status</div>
									<div className="font-semibold uppercase">{fundRequest.status}</div>
								</div>
								<div className="text-sm text-right">
									<div className="text-muted-foreground">
										{fundRequest.status === 'approved' ? 'Release Date' : 'Rejection Reason'}
									</div>
									<div className="font-semibold">
										{fundRequest.status === 'approved'
											? fundRequest.releaseDate
												? format(new Date(fundRequest.releaseDate), 'MMM d, yyyy')
												: 'Not Set'
											: fundRequest.rejectedReason}
									</div>
								</div>
							</div>
							<Separator />
							<div>
								<CardTitle className="flex items-center gap-2 mb-3">
									<FileTextIcon className="h-5 w-5 text-primary" />
									Justification for Fund
								</CardTitle>
								<div
									className="prose prose-sm max-w-none dark:prose-invert"
									dangerouslySetInnerHTML={{ __html: fundRequest.reason }}
								/>
							</div>
						</CardContent>
					</Card>

					<div className="h-fit grid grid-cols-1 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileTextIcon className="h-5 w-5 text-blue-500" />
									Submission Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-1.5">
									<p className="text-sm font-medium text-muted-foreground">Submitted By</p>
									<UserInfoCard userId={fundRequest.createdById} userName={fundRequest.createdBy} />
								</div>
								<div className="space-y-1.5">
									<p className="text-sm font-medium text-muted-foreground">Submission Date</p>
									<p className="text-sm">{format(new Date(fundRequest.createdAt), 'MMMM d, yyyy')}</p>
								</div>
								{fundRequest.status === 'rejected' && fundRequest.rejectedReason && (
									<Alert>
										<AlertCircleIcon className="h-4 w-4" />
										<AlertTitle>Rejection Reason</AlertTitle>
										<AlertDescription>{fundRequest.rejectedReason}</AlertDescription>
									</Alert>
								)}
							</CardContent>
						</Card>
						{fundRequest.status === 'released' && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ClipboardCheckIcon className="h-5 w-5 text-green-500" />
										Release Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-2">
										<p className="text-sm font-medium text-muted-foreground">Release Date</p>
										<p className="text-sm">
											{fundRequest.releaseDate ? format(new Date(fundRequest.releaseDate), 'MMMM d, yyyy') : '-'}
										</p>
										<p className="text-sm font-medium text-muted-foreground">Reference Number</p>
										<div className="flex items-center gap-2">
											<p className="text-sm">{fundRequest.referenceNumber}</p>
											<Button
												variant="ghost"
												size="icon"
												className="text-muted-foreground"
												onClick={() => {
													navigator.clipboard.writeText(fundRequest.referenceNumber ?? '');
													toast.success('Reference number copied to clipboard');
												}}
											>
												<CopyIcon className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
						{fundRequest.status === 'pending' && (
							<ButtonGuard name="fundRequest" actions={['approve', 'reject']}>
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<ClipboardCheckIcon className="h-5 w-5 text-green-500" />
											Review Actions
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-col gap-2">
											<AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
												<AlertDialogTrigger asChild>
													<Button variant="default" className="w-full justify-start">
														<CheckIcon className="h-4 w-4 mr-2" />
														Approve
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Approve Fund Request</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to approve this fund request? This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
															Cancel
														</Button>
														<Button onClick={onHandleApproveProposal}>Approve Request</Button>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>

											<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
												<AlertDialogTrigger asChild>
													<Button variant="outline" className="w-full justify-start">
														<XIcon className="h-4 w-4 mr-2" />
														Reject
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Reject Fund Request</AlertDialogTitle>
														<AlertDialogDescription>
															Please provide a reason for rejecting this fund request. This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<Textarea
														placeholder="Enter rejection reason..."
														value={rejectionReason}
														onChange={(e) => setRejectionReason(e.target.value)}
													/>
													<AlertDialogFooter>
														<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
															Cancel
														</Button>
														<Button variant="destructive" onClick={onHandleRejectProposal}>
															Reject Request
														</Button>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</CardContent>
								</Card>
							</ButtonGuard>
						)}
					</div>
				</div>
			</SectionWrapper>
		</>
	);
}
