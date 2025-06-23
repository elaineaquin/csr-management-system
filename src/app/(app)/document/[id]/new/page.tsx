'use client';

import { AccessGuard } from '@/components/access-guard';
import { PageHeader, PageHeaderHeading } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/loading-button';
import { CreateDocumentSchema, documentCategories } from '@/lib/zod/document.schema';
import { createDocumentSchema } from '@/lib/zod/document.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, FileIcon, HelpCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SectionWrapper } from '@/components/section-wrapper';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef, useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { toast } from 'sonner';
import { useCreateDocument } from '@/hooks/use-document';
import { useSession } from '@/lib/auth-client';

export default function Page() {
	const { id } = useParams();
	const uploaderRef = useRef<{ startUpload: () => Promise<string> }>(null);
	const [pending, setPending] = useState(false);
	const router = useRouter();
	const { data: session } = useSession();
	const { mutateAsync: createDocument } = useCreateDocument();

	const form = useForm<CreateDocumentSchema>({
		resolver: zodResolver(createDocumentSchema),
		defaultValues: {
			title: '',
			category: 'Reports',
		},
	});

	const onSubmit = async (data: CreateDocumentSchema) => {
		const fileId = await uploaderRef.current?.startUpload();
		try {
			if (!fileId) {
				toast.error('Please upload a document');
				return;
			}
			setPending(true);
			await createDocument({
				version: 'v1',
				message: 'Initial upload',
				document: {
					create: {
						documentFolder: {
							connect: {
								id: id as string,
							},
						},
						title: data.title,
						category: data.category,
						archived: false,
						createdBy: {
							connect: {
								id: session?.user.id,
							},
						},
					},
				},
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
		} catch (error) {
			toast.error('An error occured', {
				description: `${error}`,
			});
		} finally {
			setPending(false);
			router.push(`/document/${id}`);
		}
	};

	return (
		<AccessGuard page="document" actions={['create']}>
			<PageHeader>
				<Button variant={'ghost'} size={'icon'} className="mr-2" onClick={() => router.push('/document')}>
					<ArrowLeftIcon />
				</Button>
				<div className="w-full">
					<PageHeaderHeading>Upload Document</PageHeaderHeading>
				</div>
			</PageHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<SectionWrapper className="space-y-6 py-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter a file title" {...field} />
									</FormControl>
									<FormDescription className="flex items-center gap-1">
										<FileIcon className="h-3.5 w-3.5 text-muted-foreground" />A clear title helps us understand your
										document at a glance
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
											{documentCategories.map((category) => (
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
						<FormItem>
							<FormLabel>Attach Document</FormLabel>
							<FileUploader
								ref={uploaderRef}
								acceptedFileTypes={[
									'application/pdf',
									'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
									'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
								]}
								onUploadError={(err) => toast.error('Error on uploading files', { description: err })}
							/>
						</FormItem>
					</SectionWrapper>
					<SectionWrapper>
						<LoadingButton pending={pending} type="button" onClick={form.handleSubmit(onSubmit)}>
							Upload Project
						</LoadingButton>
					</SectionWrapper>
				</form>
			</Form>
		</AccessGuard>
	);
}
