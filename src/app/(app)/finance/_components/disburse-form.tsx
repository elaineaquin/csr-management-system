'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FundRequestDisburseSchema, fundRequestDisburseSchema } from '@/lib/zod/fund-request.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Banknote, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useUpdateFundStatus } from '@/hooks/use-fund-request';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const DisburseForm = ({ fundRequestId }: { fundRequestId: string }) => {
	const { mutateAsync: updateFundRequest } = useUpdateFundStatus();
	const form = useForm<FundRequestDisburseSchema>({
		resolver: zodResolver(fundRequestDisburseSchema),
		defaultValues: {
			releaseDate: new Date(),
			referenceNumber: '',
		},
	});

	const onSubmit = (data: FundRequestDisburseSchema) => {
		try {
			updateFundRequest({
				id: fundRequestId,
				data: {
					status: 'Released',
					releaseDate: data.releaseDate,
					referenceNumber: data.referenceNumber,
				},
			});

			form.reset();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex justify-end">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						<Banknote className="h-4 w-4" />
						Release Funds
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Disburse Funds</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
							<FormField
								control={form.control}
								name="releaseDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Release Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button variant="outline" className="w-[200px] pl-3 text-left font-normal">
														{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar mode="single" selected={field.value} onSelect={field.onChange} />
											</PopoverContent>
										</Popover>
										<FormDescription>This is the date of the disbursement.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="referenceNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reference Number</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>This is the reference number for the disbursement.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit">Send Disbursement</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};
