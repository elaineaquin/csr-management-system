'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { AlertCircleIcon, CalendarIcon, XIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { cn } from '@/lib/utils'; // className helper
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { useGetKanbanFormRequirements } from '@/hooks/use-kanban';
import { Alert, AlertDescription } from '../ui/alert';

export const createTaskSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	columnId: z.string(),
	position: z.number(),
	description: z.string().optional(),
	assignees: z.array(z.string()).optional(),
	dueDate: z.coerce.date().optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;

export function AddTaskForm({
	addTaskDialogOpen,
	setAddTaskDialogOpen,
	projectId,
	initialColumn,
	onSave,
}: {
	projectId: string;
	addTaskDialogOpen: boolean;
	initialColumn?: string;
	setAddTaskDialogOpen: Dispatch<SetStateAction<boolean>>;
	onSave: (data: CreateTaskSchema) => Promise<void>;
}) {
	const { data: formRequirements } = useGetKanbanFormRequirements({ projectId });
	const form = useForm<CreateTaskSchema>({
		resolver: zodResolver(createTaskSchema),
		defaultValues: {
			title: '',
			description: '',
			assignees: [],
		},
	});

	useEffect(() => {
		if (initialColumn && formRequirements?.columns.length) {
			const col = formRequirements.columns.find((col) => col.id === initialColumn);
			if (col) {
				form.setValue('columnId', col.id);
				form.setValue('position', col.lastPosition + 1);
			}
		}
	}, [initialColumn, formRequirements?.columns, form]);

	const onSubmit = async (data: CreateTaskSchema) => {
		await onSave(data);
		form.reset();
		setAddTaskDialogOpen(false);
	};

	return (
		<Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>New Task</DialogTitle>
					{form.formState.errors.root && (
						<Alert variant="destructive" className="border-destructive bg-destructive/10 mt-4">
							<AlertCircleIcon className="h-4 w-4" />
							<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
						</Alert>
					)}
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Task title" {...field} />
									</FormControl>
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
										<Textarea placeholder="Add task details" className="resize-none" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="columnId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Column</FormLabel>
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
													{formRequirements?.columns.find((col) => col.id === field.value)?.title ?? 'Select column'}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="p-0" align="start">
											<Command>
												<CommandInput placeholder="Search columns..." />
												<CommandEmpty>No columns found.</CommandEmpty>
												<CommandGroup>
													{formRequirements?.columns.map((col) => (
														<CommandItem
															key={col.id}
															value={col.title}
															onSelect={() => {
																form.setValue('columnId', col.id);
																form.setValue('position', col.lastPosition + 1); // Auto-set position
															}}
														>
															{col.title}
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Due Date (Optional)</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={'outline'}
													className={cn(
														'w-full pl-3 text-left font-normal justify-start',
														!field.value && 'text-muted-foreground',
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value ? format(field.value, 'PPP') : 'Pick a date'}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												fromDate={
													new Date(
														Math.max(formRequirements?.duration?.from?.getTime() ?? 0, new Date().setHours(0, 0, 0, 0)),
													)
												}
												toDate={formRequirements?.duration.to}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="assignees"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Assignees</FormLabel>
									<div className="flex flex-wrap gap-2">
										{(field.value ?? []).map((userId) => {
											const volunteer = formRequirements?.users?.find((u) => u.user.id === userId);
											return (
												<Button
													key={userId}
													variant={'outline'}
													onClick={(e) => {
														e.stopPropagation();
														const newValue = (field.value ?? []).filter((id) => id !== userId);
														field.onChange(newValue);
													}}
												>
													{volunteer?.user.name || volunteer?.user.email}
													<XIcon className="h-3 w-3 cursor-pointer" />
												</Button>
											);
										})}
									</div>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant="outline" className="w-full justify-start text-left font-normal">
													<span>Add assignees</span>
												</Button>
											</PopoverTrigger>
											<PopoverContent className="p-0" side="bottom" align="start">
												<Command>
													<CommandInput placeholder="Search users..." />
													<CommandEmpty>No users found.</CommandEmpty>
													<CommandGroup>
														{formRequirements?.users.map((volunteer) => {
															if (!volunteer) return null;
															return (
																<CommandItem
																	key={volunteer.user.id}
																	onSelect={() => {
																		if (!(field.value ?? []).includes(volunteer.user.id)) {
																			field.onChange([...(field.value ?? []), volunteer.user.id]);
																		}
																	}}
																>
																	<div className="flex flex-col">
																		<span>{volunteer.user.name || volunteer.user.email}</span>
																		<span className="text-xs">
																			Availability:{' '}
																			{volunteer.availability.length > 0
																				? volunteer.availability.map((a) => a.day).join(', ')
																				: 'Not set'}
																		</span>
																	</div>
																</CommandItem>
															);
														})}
													</CommandGroup>
												</Command>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2">
							<Button variant="ghost" type="button" onClick={() => setAddTaskDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">Create Task</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
