'use client';

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import {
	ArrowLeftIcon,
	TimerIcon,
	FileTextIcon,
	InfoIcon,
	BanknoteIcon,
	MinusIcon,
	PlusIcon,
	CalendarIcon,
	AlertCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { SectionWrapper } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetProject, useReviseProject } from '@/hooks/use-project';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateProjectSchema, UpdateProjectSchema } from '@/lib/zod/project.schema';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LoadingButton } from '@/components/loading-button';

export default function ProjectRevisionPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data, isLoading, error } = useGetProject({ id: id as string });
	const { mutate: reviseProject, isPending: isRevising } = useReviseProject();
	const minBudget = 100;

	const form = useForm<UpdateProjectSchema>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			title: '',
			description: '',
			budget: 0,
			timeline: {
				from: new Date(),
				to: new Date(),
			},
		},
	});

	// Initialize form data when project data is loaded
	useEffect(() => {
		if (data) {
			form.reset({
				title: data.title || '',
				description: data.description || '',
				budget: data.budget || 0,
				timeline: {
					from: data.from,
					to: data.to,
				},
			});
		}
	}, [data, form]);

	const onSubmit = (values: UpdateProjectSchema) => {
		if (!data) return;

		reviseProject({
			id: data.id,
			data: {
				status: 'Pending',
				revisionRequest: false,
				title: values.title,
				description: values.description,
				budget: values.budget,
				from: values.timeline?.from,
				to: values.timeline?.to,
			},
		});
	};

	if (error) {
		return (
			<Card className="mx-auto max-w-2xl mt-8">
				<CardHeader>
					<CardTitle className="text-destructive">Error Loading Project</CardTitle>
				</CardHeader>
				<CardContent>
					<p>We couldn&apos;t load the project details. Please try again later.</p>
				</CardContent>
			</Card>
		);
	}

	if (isLoading || !data) {
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
				</PageHeader>

				<SectionWrapper>
					<Card>
						<CardContent className="space-y-6 pt-6">
							<Skeleton className="h-4 w-full mb-2" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-10 w-32" />
						</CardContent>
					</Card>
				</SectionWrapper>
			</>
		);
	}

	return (
		<>
			<PageHeader>
				<Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push(`/project/${id}`)}>
					<ArrowLeftIcon className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<PageHeaderHeading>Project Revision</PageHeaderHeading>
					<PageHeaderDescription>Update your project based on the revision request</PageHeaderDescription>
				</div>
			</PageHeader>

			<SectionWrapper>
				<Alert variant="destructive">
					<AlertCircleIcon className="h-4 w-4" />
					<AlertTitle>Revision Request</AlertTitle>
					<AlertDescription>{data.revisionReason}</AlertDescription>
				</Alert>
			</SectionWrapper>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<SectionWrapper className="py-2 flex flex-row items-center justify-between">
						<h3 className="text-lg font-medium flex items-center">
							<FileTextIcon className="h-4 w-4 mr-2" />
							Project Details
						</h3>
					</SectionWrapper>
					<SectionWrapper className="space-y-6 py-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter a title for your proposal" {...field} />
									</FormControl>
									<FormDescription className="flex items-center gap-1">
										<FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />A clear title helps us understand your
										project at a glance
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
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
					<SectionWrapper className="py-2 flex flex-row items-center justify-between">
						<h3 className="text-lg font-medium flex items-center">
							<BanknoteIcon className="h-4 w-4 mr-2" />
							Budget & Timeline
						</h3>
					</SectionWrapper>
					<SectionWrapper className="space-y-6 py-6">
						<FormField
							control={form.control}
							name="budget"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Budget</FormLabel>
									<div className="flex">
										<FormControl>
											<Input
												type="number"
												{...field}
												className="rounded-r-none"
												value={field.value || minBudget}
												onChange={(e) => field.onChange(Number(e.target.value))}
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
															const newBudget = Math.max(minBudget, (field.value || minBudget) - 100);
															form.setValue('budget', newBudget);
														}}
													>
														<MinusIcon className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Decrease budget</TooltipContent>
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
															const newBudget = (field.value || minBudget) + 100;
															form.setValue('budget', newBudget);
														}}
													>
														<PlusIcon className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Increase budget</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<FormDescription className="flex items-center gap-1">
										<InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
										Minimum budget is Php{minBudget}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="timeline"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Project Timeline</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														'w-full justify-start text-left font-normal',
														!field.value && 'text-muted-foreground',
													)}
												>
													<CalendarIcon className="w-4 h-4 mr-2" />
													{field.value?.from ? (
														field.value.to ? (
															<>
																{format(field.value.from, 'MMMM dd, yyyy')} - {format(field.value.to, 'MMMM dd, yyyy')}
															</>
														) : (
															format(field.value.from, 'MMMM dd, yyyy')
														)
													) : (
														<span>Select project timeline</span>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												initialFocus
												mode="range"
												defaultMonth={field.value?.from}
												selected={field.value}
												onSelect={field.onChange}
												numberOfMonths={2}
												disabled={(date: Date) => date < new Date()}
											/>
										</PopoverContent>
									</Popover>
									<FormDescription className="flex items-center gap-1">
										<TimerIcon className="h-3.5 w-3.5 text-muted-foreground" />
										Select the expected start and end dates for your project
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</SectionWrapper>
					<SectionWrapper>
						<LoadingButton pending={isRevising} type="submit">
							Submit Revision
						</LoadingButton>
					</SectionWrapper>
				</form>
			</Form>
		</>
	);
}
