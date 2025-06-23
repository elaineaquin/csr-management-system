'use client';

import { AccessGuard } from '@/components/access-guard';
import { FileUploader } from '@/components/file-uploader';
import { LoadingButton } from '@/components/loading-button';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { RichTextEditor } from '@/components/rich-text-editor';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import { useCreateDocument } from '@/hooks/use-document';
import { useCreateFundRequest } from '@/hooks/use-fund-request';
import { useGetProjectsList } from '@/hooks/use-project';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { createFundRequestSchema, CreateFundRequestSchema, expenseCategories } from '@/lib/zod/fund-request.schema';
import { ProjectWithCreator } from '@/types/project.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { FundRequestCategoryType } from '@prisma/client';
import {
	ArrowLeftIcon,
	CheckIcon,
	ChevronsUpDownIcon,
	FileIcon,
	FolderIcon,
	HelpCircleIcon,
	InfoIcon,
	MinusIcon,
	PlusIcon,
	SearchIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function Page() {
	// states
	const [pending, setPending] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [maxAmount, setMaxAmount] = useState<number>(0);

	// hooks
	const router = useRouter();
	const { mutateAsync: uploadDocumentAsync } = useCreateDocument();
	const debouncedQuery = useDebounce(searchQuery, 300);
	const uploaderRef = useRef<{ startUpload: () => Promise<string> }>(null);
	const { data: session } = useSession();
	const { data: projects, isLoading } = useGetProjectsList({
		title: debouncedQuery,
		status: 'Approved',
		userOnly: false,
	});
	const { mutateAsync: createFundRequestAsync } = useCreateFundRequest();
	const form = useForm<CreateFundRequestSchema>({
		resolver: zodResolver(createFundRequestSchema),
		defaultValues: {
			amount: 100,
			category: 'Donations',
			justification: '',
			projectId: '',
		},
	});

	const onSubmit = async (values: CreateFundRequestSchema) => {
		const fileId = await uploaderRef.current?.startUpload();
		setPending(true);
		try {
			if (values.amount > maxAmount) {
				toast.error('Amount exceeds the maximum allowed.');
				return;
			}

			if (values.amount < 100) {
				toast.error('Amount must be at least 100');
				return;
			}

			let documentResult;
			if (fileId) {
				documentResult = await uploadDocumentAsync({
					version: 'v1',
					document: {},
					createdBy: {
						connect: {
							id: session?.user.id,
						},
					},
					attachment: {
						connect: {
							id: fileId,
						},
					},
				});
			}

			await createFundRequestAsync({
				amount: values.amount,
				category: values.category as FundRequestCategoryType,
				reason: values.justification,
				status: 'Pending',
				project: {
					connect: {
						id: values.projectId,
					},
				},
				createdBy: {
					connect: {
						id: session?.user.id,
					},
				},
				...(documentResult && {
					documents: {
						connect: {
							id: documentResult.id,
						},
					},
				}),
			});
		} catch (error) {
			toast.error('An error occured', {
				description: error instanceof Error ? error.message : 'An unknown error occurred',
			});
		} finally {
			setPending(false);
		}
	};

	const projectId = form.watch('projectId');

	useEffect(() => {
		if (projectId) {
			const maxAmount = projects?.find((project: ProjectWithCreator) => project.id === projectId)?.budget;
			form.setValue('amount', 0);
			setMaxAmount(maxAmount || 0);
		}
	}, [projectId, projects, form]);

	return (
		<AccessGuard page="fundRequest" actions={['create']}>
			<PageHeader>
				<Button variant={'ghost'} size={'icon'} className="mr-2" onClick={() => router.push('/finance')}>
					<ArrowLeftIcon />
				</Button>
				<div className="w-full">
					<PageHeaderHeading>Create New Fund Request</PageHeaderHeading>
					<PageHeaderDescription>Submit a new CSR Fund request for approval</PageHeaderDescription>
				</div>
			</PageHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<SectionWrapper className="space-y-6 py-6">
						<FormField
							control={form.control}
							name="projectId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Project</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={'outline'}
													className={cn('justify-between', !field.value && 'text-muted-foreground')}
												>
													{field.value
														? projects?.find((project: ProjectWithCreator) => project.id === field.value)?.title ||
														  'Select Project'
														: 'Select Project'}
													<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent side="bottom" align="start" className="p-0">
											<Command>
												<div className="flex h-9 items-center gap-2 border-b px-3">
													<SearchIcon className="size-4 shrink-0 opacity-50" />
													<Input
														placeholder="Search project..."
														onChange={(e) => setSearchQuery(e.target.value)}
														className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none disabled:cursor-not-allowed disabled:opacity-50  border-0 shadow-none"
													/>
												</div>
												<CommandList>
													{!isLoading && projects?.length === 0 && <CommandEmpty>No project found.</CommandEmpty>}
													<CommandGroup>
														{projects?.map((project: ProjectWithCreator) => (
															<CommandItem
																key={project.id}
																value={project.id}
																onSelect={() => {
																	form.setValue('projectId', project.id);
																}}
															>
																{project.title}
																<CheckIcon
																	className={cn('ml-auto', project.id === field.value ? 'opacity-100' : 'opacity-0')}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormDescription className="flex items-center gap-1">
										<FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
										Choose the relevant project to link this funding request to its budget and reporting.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Budget</FormLabel>
									<div className="flex">
										<FormControl>
											<Input
												type="number"
												{...field}
												className="rounded-r-none"
												value={field.value || 0}
												onChange={(e) => {
													const value = Number(e.target.value);
													field.onChange(value);
												}}
											/>
										</FormControl>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														type="button"
														variant="outline"
														size="icon"
														className="rounded-none border-r-0"
														onClick={() => {
															const newAmount = (field.value || 0) - 100;
															form.setValue('amount', newAmount);
														}}
													>
														<MinusIcon className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Decrease Amount</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														type="button"
														variant="outline"
														size="icon"
														className="rounded-l-none border-r-1"
														onClick={() => {
															const current = field.value ?? 0;

															if (current >= maxAmount) {
																toast.error('Amount cannot exceed the maximum budget amount', {
																	description: `Maximum amount is Php ${maxAmount}`,
																});
																return;
															}

															const newAmount = current + 100;
															form.setValue('amount', newAmount);
														}}
													>
														<PlusIcon className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Increase Amount</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<FormDescription className="flex items-center gap-1">
										<InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
										Maximum Project Budget is Php {maxAmount}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a fund request category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{expenseCategories.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription className="flex items-center gap-1 text-muted-foreground">
										<HelpCircleIcon className="h-4 w-4" />
										Choose the appropriate category for the fund usage.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="justification"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Justification</FormLabel>
									<FormControl>
										<RichTextEditor
											{...field}
											placeholder="Describe your project goals, requirements, and any specific details"
										/>
									</FormControl>
									<FormDescription className="flex items-center gap-1">
										<InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
										Be as detailed as possible to help us understand your needs
									</FormDescription>

									<FormMessage />
								</FormItem>
							)}
						/>
					</SectionWrapper>
				</form>
			</Form>
			<SectionWrapper className="py-2 flex flex-col items-stretch w-full space-y-2">
				<h3 className="text-lg font-medium flex items-center">
					<FolderIcon className="h-4 w-4 mr-2" />
					Supporting Documents (Optional)
				</h3>
				<p className="flex items-center gap-1 text-muted-foreground text-sm">
					Documents uploaded here will be automatically saved to Document Repository
				</p>
				<FileUploader
					ref={uploaderRef}
					acceptedFileTypes={[
						'application/pdf',
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
					]}
					onUploadError={(err) => toast.error('Error on uploading files', { description: err })}
				/>
			</SectionWrapper>
			<SectionWrapper>
				<LoadingButton pending={pending} type="button" onClick={form.handleSubmit(onSubmit)}>
					Submit Request
				</LoadingButton>
			</SectionWrapper>
		</AccessGuard>
	);
}
