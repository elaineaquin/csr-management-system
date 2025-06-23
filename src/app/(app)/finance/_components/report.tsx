'use client';

import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import { FileText, BarChart2, Clock3, LucideIcon, CalendarIcon, TerminalIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	useGetFundRequestApprovalTurnAround,
	useGetFundRequestExpensesSummary,
	useGetFundRequestHistory,
} from '@/hooks/use-fund-request';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { EmptyState } from './empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FundRequestHistoryPreview } from './fund-request-history-preview';
import { ApprovalTurnaroundPreview } from './approval-turnaround-preview';
import { ExpenseSummaryPreview } from './expense-summary-preview';
import { ExportFactory, ExportFormats, ReportTypes } from '@/lib/export-utils';

const reportOptions: { label: string; value: ReportTypes; icon: LucideIcon }[] = [
	{ label: 'Fund Request History', value: 'fundRequestHistory', icon: FileText },
	{ label: 'Expense Summary', value: 'expenseSummary', icon: BarChart2 },
	{ label: 'Approval Turnaround Time', value: 'approvalTurnaroundTime', icon: Clock3 },
];

export function Report() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [selectedReport, setSelectedReport] = useState<ReportTypes>('fundRequestHistory');
	const [exportFormat, setExportFormat] = useState<ExportFormats>('csv');
	const [date, setDate] = useState<DateRange | undefined>({
		from: addDays(new Date(), -7),
		to: new Date(),
	});
	const reportParams = useMemo(() => ({ from: date!.from!, to: date!.to! }), [date]);
	const { data: fundRequestHistory, refetch: refetchFundRequestHistory } = useGetFundRequestHistory(reportParams);
	const { data: expenseSummary, refetch: refetchExpenseSummary } = useGetFundRequestExpensesSummary(reportParams);
	const { data: approvalTurnaround, refetch: refetchApprovalTurnaround } =
		useGetFundRequestApprovalTurnAround(reportParams);

	const generateReport = async () => {
		setIsGenerating(true);
		const toastId = toast.loading('Generating report...');
		try {
			switch (selectedReport) {
				case 'fundRequestHistory':
					refetchFundRequestHistory();
					break;
				case 'expenseSummary':
					refetchExpenseSummary();
					break;
				case 'approvalTurnaroundTime':
					refetchApprovalTurnaround();
					break;
			}
			toast.success('Report generated successfully.', { id: toastId });
		} catch (error) {
			toast.error('Failed to generate report. Please try again later.', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const exportReport = async () => {
		setIsExporting(true);
		const toastId = toast.loading('Exporting report...');
		try {
			const exporter = ExportFactory.createExporter(exportFormat);

			switch (selectedReport) {
				case 'fundRequestHistory':
					if (!fundRequestHistory) throw new Error('No data available for export.');
					await exporter.export(fundRequestHistory, selectedReport, { previewElementId: 'report-preview-content' });
					break;
				case 'expenseSummary':
					if (!expenseSummary) throw new Error('No data available for export.');
					await exporter.export(expenseSummary, selectedReport, { previewElementId: 'report-preview-content' });
					break;
				case 'approvalTurnaroundTime':
					if (!approvalTurnaround) throw new Error('No data available for export.');
					await exporter.export(approvalTurnaround, selectedReport, { previewElementId: 'report-preview-content' });
					break;
				default:
					throw new Error('Invalid report type selected.');
			}
			toast.success(`Report exported as ${exportFormat.toUpperCase()}.`, { id: toastId });
		} catch (error) {
			toast.error('Failed to export report. Please try again later.', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		} finally {
			setIsExporting(false);
		}
	};

	const isSelected = (value: ReportTypes) => selectedReport === value;

	const renderPreview = () => {
		switch (selectedReport) {
			case 'fundRequestHistory':
				return fundRequestHistory ? <FundRequestHistoryPreview data={fundRequestHistory} /> : <EmptyState />;
			case 'expenseSummary':
				return expenseSummary ? <ExpenseSummaryPreview data={expenseSummary} /> : <EmptyState />;
			case 'approvalTurnaroundTime':
				return approvalTurnaround ? <ApprovalTurnaroundPreview data={approvalTurnaround} /> : <EmptyState />;
			default:
				return (
					<Alert>
						<TerminalIcon className="w-6 h-6" />
						<AlertTitle>No Report Selected</AlertTitle>
						<AlertDescription>
							No records found for the selected criteria. Please adjust your filters and try again.
						</AlertDescription>
					</Alert>
				);
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-3">
			<div className="grid grid-cols-1 gap-2 md:col-span-1 h-fit">
				<Card>
					<CardContent className="space-y-2">
						<CardTitle>Select Report Type</CardTitle>
						{reportOptions.map(({ label, value, icon: Icon }) => (
							<Button
								key={value}
								variant={isSelected(value) ? 'default' : 'outline'}
								onClick={() => setSelectedReport(value)}
								className="flex items-center w-full gap-2 justify-start"
							>
								<Icon className="w-4 h-4" />
								{label}
							</Button>
						))}
						<CardTitle className="mt-4">Select Date Range</CardTitle>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
								>
									<CalendarIcon />{' '}
									{date?.from ? (
										date.to ? (
											<>
												{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
											</>
										) : (
											format(date.from, 'LLL dd, y')
										)
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>{' '}
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={date?.from}
									selected={date}
									onSelect={setDate}
									numberOfMonths={2}
									disabled={{ after: new Date() }}
								/>
							</PopoverContent>
						</Popover>
						<LoadingButton variant={'secondary'} pending={isGenerating} onClick={() => generateReport()}>
							Generate Report
						</LoadingButton>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Export Report</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormats)}>
							<SelectTrigger className="w-full">
								<BarChart2 className="w-4 h-4 mr-2" />
								Export as {exportFormat.toUpperCase()}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="csv">CSV</SelectItem>
								<SelectItem value="pdf">PDF</SelectItem>
								<SelectItem value="xlsx">XLSX</SelectItem>
							</SelectContent>
						</Select>
						<LoadingButton pending={isExporting} onClick={() => exportReport()}>
							Export Report
						</LoadingButton>
					</CardContent>
				</Card>
			</div>
			<div className="grid grid-cols-1 gap-2 md:col-span-2">
				<Card>
					<CardContent>
						<div id="report-preview-content">{renderPreview()}</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
