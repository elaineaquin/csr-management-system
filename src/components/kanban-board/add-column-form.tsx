'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircleIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useGetKanbanFormRequirements } from '@/hooks/use-kanban';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const createColumnSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	boardId: z.string().min(1, 'Board ID is required'),
	position: z.number().min(0),
	color: z.enum(['Red', 'Green', 'Blue', 'Violet', 'Orange', 'Yellow', 'Gray']),
});

export type CreateColumnSchema = z.infer<typeof createColumnSchema>;

export function AddColumnForm({
	addColumnDialogOpen,
	setAddColumnDialogOpen,
	projectId,
	onSave,
}: {
	projectId: string;
	addColumnDialogOpen: boolean;
	setAddColumnDialogOpen: Dispatch<SetStateAction<boolean>>;
	onSave: (data: CreateColumnSchema) => Promise<void>;
}) {
	const { data: formRequirements } = useGetKanbanFormRequirements({ projectId });

	const form = useForm<CreateColumnSchema>({
		resolver: zodResolver(createColumnSchema),
		defaultValues: {
			title: '',
			boardId: '', // will be updated when data is loaded
			position: 0, // will be updated
			color: 'Gray', // default
		},
	});

	// Wait for formRequirements (which includes boardId and next position)
	useEffect(() => {
		if (formRequirements?.boardId && typeof formRequirements?.boardLastPosition === 'number') {
			form.setValue('boardId', formRequirements.boardId);
			form.setValue('position', formRequirements.boardLastPosition + 1);
		}
	}, [formRequirements, form]);

	const onSubmit = async (data: CreateColumnSchema) => {
		await onSave(data);
		form.reset();
		setAddColumnDialogOpen(false);
	};

	return (
		<Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>New Column</DialogTitle>
					{form.formState.errors.root && (
						<Alert variant="destructive" className="border-destructive bg-destructive/10 mt-4">
							<AlertCircleIcon className="h-4 w-4" />
							<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
						</Alert>
					)}
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
						{/* Title Field */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Column title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Color Picker */}
						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Color</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a color" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{['Red', 'Green', 'Blue', 'Violet', 'Orange', 'Yellow', 'Gray'].map((color) => (
												<SelectItem key={color} value={color}>
													<span className={`inline-block w-3 h-3 rounded-full mr-2 bg-${color.toLowerCase()}-500`} />
													{color}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2">
							<Button variant="ghost" type="button" onClick={() => setAddColumnDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">Create Column</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
