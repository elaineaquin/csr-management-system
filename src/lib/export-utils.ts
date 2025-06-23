/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export type ReportTypes = 'fundRequestHistory' | 'expenseSummary' | 'approvalTurnaroundTime';
export type ExportFormats = 'csv' | 'pdf' | 'xlsx';

interface ExportOptions {
	filename?: string;
	previewElementId?: string;
}

export class ExportFactory {
	static createExporter(format: ExportFormats) {
		switch (format) {
			case 'csv':
				return new CsvExporter();
			case 'pdf':
				return new PdfExporter();
			case 'xlsx':
				return new XlsxExporter();
			default:
				throw new Error(`Unsupported export format: ${format}`);
		}
	}
}

class CsvExporter {
	async export(data: any, reportType: ReportTypes, options?: ExportOptions): Promise<void> {
		const filename = options?.filename || this.generateFilename(reportType, 'csv');
		let csvContent = '';

		switch (reportType) {
			case 'fundRequestHistory':
				csvContent = this.exportFundRequestHistory(data);
				break;
			case 'expenseSummary':
				csvContent = this.exportExpenseSummary(data);
				break;
			case 'approvalTurnaroundTime':
				csvContent = this.exportApprovalTurnaround(data);
				break;
		}

		this.downloadCsv(csvContent, filename);
	}

	private generateFilename(reportType: ReportTypes, extension: string): string {
		const reportNames = {
			fundRequestHistory: 'Fund_Request_History',
			expenseSummary: 'Expense_Summary',
			approvalTurnaroundTime: 'Approval_Turnaround_Time',
		};
		return `${reportNames[reportType]}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.${extension}`;
	}

	private exportFundRequestHistory(data: any): string {
		let csv =
			'Project Title,Budget,Status,Created Date,Updated Date,Fund Requests Count,Total Amount Requested,Needs Attention\n';

		data.histories.forEach((history: any) => {
			const totalRequested = history.fundRequests.reduce((sum: number, fr: any) => sum + fr.amount, 0);
			csv += `"${history.title}",${history.budget},"${history.status}","${format(
				new Date(history.createdAt),
				'yyyy-MM-dd',
			)}","${format(new Date(history.updatedAt), 'yyyy-MM-dd')}",${history.fundRequests.length},${totalRequested},"${
				history.needsAttention ? 'Yes' : 'No'
			}"\n`;

			// Add fund request details
			history.fundRequests.forEach((fr: any) => {
				csv += `"  - ${fr.category}",${fr.amount},"${fr.status}","${format(
					new Date(fr.createdAt),
					'yyyy-MM-dd',
				)}","","","","${fr.referenceNumber}"\n`;
			});
		});

		return csv;
	}

	private exportExpenseSummary(data: any): string {
		let csv = 'Category,Total Amount,Request Count,Pending,Approved,Rejected,Released,Percentage\n';
		const totalExpenses = data.reduce((sum: number, item: any) => sum + item.total, 0);

		data.forEach((item: any) => {
			const percentage = ((item.total / totalExpenses) * 100).toFixed(2);
			csv += `"${item.category}",${item.total},${item.count},${item.pending},${item.approved},${item.rejected},${item.released},"${percentage}%"\n`;
		});

		return csv;
	}

	private exportApprovalTurnaround(data: any): string {
		let csv = 'Metric,Value\n';
		csv += `"Average Turnaround Hours",${data.averageTurnaroundHours}\n`;
		csv += `"Average Turnaround Days",${(data.averageTurnaroundHours / 24).toFixed(2)}\n`;
		csv += `"Total Requests",${data.totalRequests}\n\n`;

		csv += 'Request ID,Turnaround Hours,Turnaround Days\n';
		data.details.forEach((detail: any) => {
			csv += `"${detail.id}",${detail.turnaroundHours.toFixed(4)},${(detail.turnaroundHours / 24).toFixed(2)}\n`;
		});

		return csv;
	}

	private downloadCsv(content: string, filename: string): void {
		const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

class PdfExporter {
	async export(data: any, reportType: ReportTypes, options?: ExportOptions): Promise<void> {
		const filename = options?.filename || this.generateFilename(reportType, 'pdf');

		try {
			await this.exportProgrammatic(data, reportType, filename);
		} catch (error) {
			console.error('PDF export failed:', error);
			throw error;
		}
	}

	private generateFilename(reportType: ReportTypes, extension: string): string {
		const reportNames = {
			fundRequestHistory: 'Fund_Request_History',
			expenseSummary: 'Expense_Summary',
			approvalTurnaroundTime: 'Approval_Turnaround_Time',
		};
		return `${reportNames[reportType]}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.${extension}`;
	}

	private getReportDisplayName(reportType: ReportTypes): string {
		const displayNames = {
			fundRequestHistory: 'Fund Request History',
			expenseSummary: 'Expense Summary',
			approvalTurnaroundTime: 'Approval Turnaround Time',
		};
		return displayNames[reportType];
	}

	private async exportProgrammatic(data: any, reportType: ReportTypes, filename: string): Promise<void> {
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		this.addPdfHeader(pdf, reportType);

		let yPosition = 40;

		switch (reportType) {
			case 'fundRequestHistory':
				yPosition = this.addFundRequestHistoryContent(pdf, data, yPosition);
				break;
			case 'expenseSummary':
				yPosition = this.addExpenseSummaryContent(pdf, data, yPosition);
				break;
			case 'approvalTurnaroundTime':
				this.addApprovalTurnaroundContent(pdf, data, yPosition);
				break;
		}

		this.addPdfFooter(pdf, 1, 1);
		pdf.save(filename);
	}

	private addPdfHeader(pdf: jsPDF, reportType: ReportTypes): void {
		pdf.setFontSize(20);
		pdf.setFont('helvetica', 'bold');
		pdf.text('CSR Management System', 10, 15);

		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');
		pdf.text(`Report: ${this.getReportDisplayName(reportType)}`, 10, 22);
		pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 10, 27);

		pdf.setLineWidth(0.5);
		pdf.line(10, 30, 200, 30);
	}

	private addPdfFooter(pdf: jsPDF, currentPage: number, totalPages: number): void {
		const pageHeight = pdf.internal.pageSize.getHeight();
		pdf.setFontSize(10);
		pdf.setFont('helvetica', 'normal');
		pdf.text(`Page ${currentPage} of ${totalPages}`, 10, pageHeight - 10);
		pdf.text('CSR Management System', 150, pageHeight - 10);
	}

	private addFundRequestHistoryContent(pdf: jsPDF, data: any, startY: number): number {
		let yPosition = startY;

		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Summary Statistics', 10, yPosition);
		yPosition += 10;

		const totalBudget = data.histories.reduce((sum: number, h: any) => sum + h.budget, 0);
		const totalRequests = data.histories.reduce((sum: number, h: any) => sum + h.fundRequests.length, 0);
		const approvedCount = data.histories.filter((h: any) => h.status === 'approved').length;

		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');
		pdf.text(`Total Projects: ${data.total}`, 10, yPosition);
		pdf.text(`Total Budget: ₱${totalBudget.toLocaleString()}`, 70, yPosition);
		yPosition += 7;
		pdf.text(`Fund Requests: ${totalRequests}`, 10, yPosition);
		pdf.text(`Approved Projects: ${approvedCount}`, 70, yPosition);
		yPosition += 15;

		// Project details
		data.histories.forEach((history: any, index: number) => {
			if (yPosition > 250) {
				pdf.addPage();
				this.addPdfHeader(pdf, 'fundRequestHistory');
				yPosition = 40;
			}

			pdf.setFontSize(14);
			pdf.setFont('helvetica', 'bold');
			pdf.text(`${index + 1}. ${history.title}`, 10, yPosition);
			yPosition += 7;

			pdf.setFontSize(10);
			pdf.setFont('helvetica', 'normal');
			pdf.text(`Budget: ₱${history.budget.toLocaleString()}`, 15, yPosition);
			pdf.text(`Status: ${history.status.toUpperCase()}`, 80, yPosition);
			yPosition += 5;

			pdf.text(`Created: ${format(new Date(history.createdAt), 'MMM dd, yyyy')}`, 15, yPosition);
			pdf.text(
				`Period: ${format(new Date(history.from), 'MMM dd')} - ${format(new Date(history.to), 'MMM dd, yyyy')}`,
				80,
				yPosition,
			);
			yPosition += 8;

			if (history.fundRequests.length > 0) {
				pdf.setFont('helvetica', 'bold');
				pdf.text('Fund Requests:', 15, yPosition);
				yPosition += 5;

				history.fundRequests.forEach((fr: any) => {
					pdf.setFont('helvetica', 'normal');
					pdf.text(`• ${fr.category}: ₱${fr.amount.toLocaleString()} (${fr.status})`, 20, yPosition);
					yPosition += 4;
				});
			}
			yPosition += 8;
		});

		return yPosition;
	}

	private addExpenseSummaryContent(pdf: jsPDF, data: any, startY: number): number {
		let yPosition = startY;

		const totalExpenses = data.reduce((sum: number, item: any) => sum + item.total, 0);
		const totalCount = data.reduce((sum: number, item: any) => sum + item.count, 0);

		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Expense Summary Overview', 10, yPosition);
		yPosition += 10;

		pdf.setFontSize(12);
		pdf.setFont('helvetica', 'normal');
		pdf.text(`Total Expenses: ₱${totalExpenses.toLocaleString()}`, 10, yPosition);
		pdf.text(`Total Requests: ${totalCount}`, 80, yPosition);
		pdf.text(`Categories: ${data.length}`, 150, yPosition);
		yPosition += 15;

		// Add a table for categories
		pdf.setFontSize(10);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Category', 10, yPosition);
		pdf.text('Total', 60, yPosition);
		pdf.text('Count', 85, yPosition);
		pdf.text('Pending', 105, yPosition);
		pdf.text('Approved', 130, yPosition);
		pdf.text('Rejected', 160, yPosition);
		pdf.text('Released', 185, yPosition);
		yPosition += 5;

		pdf.line(10, yPosition, 200, yPosition);
		yPosition += 5;

		pdf.setFont('helvetica', 'normal');
		data.forEach((item: any) => {
			if (yPosition > 250) {
				pdf.addPage();
				this.addPdfHeader(pdf, 'expenseSummary');
				yPosition = 40;

				// Repeat header
				pdf.setFontSize(10);
				pdf.setFont('helvetica', 'bold');
				pdf.text('Category', 10, yPosition);
				pdf.text('Total', 60, yPosition);
				pdf.text('Count', 85, yPosition);
				pdf.text('Pending', 105, yPosition);
				pdf.text('Approved', 130, yPosition);
				pdf.text('Rejected', 160, yPosition);
				pdf.text('Released', 185, yPosition);
				yPosition += 5;

				pdf.line(10, yPosition, 200, yPosition);
				yPosition += 5;
				pdf.setFont('helvetica', 'normal');
			}

			const percentage = (item.total / totalExpenses) * 100;

			pdf.text(item.category, 10, yPosition);
			pdf.text(`₱${item.total.toLocaleString()}`, 60, yPosition);
			pdf.text(`${item.count}`, 85, yPosition);
			pdf.text(`${item.pending}`, 105, yPosition);
			pdf.text(`${item.approved}`, 130, yPosition);
			pdf.text(`${item.rejected}`, 160, yPosition);
			pdf.text(`${item.released}`, 185, yPosition);
			yPosition += 7;

			// Add percentage bar visualization
			pdf.text(`${percentage.toFixed(1)}% of total expenses`, 20, yPosition);
			yPosition += 7;

			// Draw percentage bar
			pdf.setDrawColor(200, 200, 200);
			pdf.setFillColor(200, 200, 200);
			pdf.rect(20, yPosition - 3, 160, 3, 'F');

			// Fill percentage
			pdf.setFillColor(41, 98, 255); // Blue color
			pdf.rect(20, yPosition - 3, (percentage / 100) * 160, 3, 'F');

			yPosition += 5;
		});

		return yPosition;
	}

	private addApprovalTurnaroundContent(pdf: jsPDF, data: any, startY: number): number {
		let yPosition = startY;

		const avgHours = data.averageTurnaroundHours;
		const avgDays = avgHours / 24;
		const performance = avgHours < 24 ? 'Excellent' : avgHours < 72 ? 'Good' : 'Needs Improvement';

		pdf.setFontSize(16);
		pdf.setFont('helvetica', 'bold');
		pdf.text('Approval Turnaround Analysis', 10, yPosition);
		yPosition += 15;

		// Add performance indicator
		pdf.setFontSize(14);
		pdf.text('Performance Rating:', 10, yPosition);

		// Add colored performance indicator
		if (performance === 'Excellent') {
			pdf.setTextColor(46, 124, 43); // Green
		} else if (performance === 'Good') {
			pdf.setTextColor(201, 148, 0); // Yellow/Orange
		} else {
			pdf.setTextColor(220, 53, 69); // Red
		}
		pdf.setFont('helvetica', 'bold');
		pdf.text(performance, 70, yPosition);
		pdf.setTextColor(0, 0, 0); // Reset to black
		pdf.setFont('helvetica', 'normal');
		yPosition += 10;

		pdf.setFontSize(12);
		pdf.text(`Average Turnaround: ${avgHours.toFixed(2)} hours (${avgDays.toFixed(1)} days)`, 10, yPosition);
		yPosition += 7;
		pdf.text(`Total Requests: ${data.totalRequests}`, 10, yPosition);
		yPosition += 15;

		// Add performance scale visualization
		pdf.setFontSize(10);
		pdf.text('Performance Scale:', 10, yPosition);
		yPosition += 7;

		// Draw scale
		const scaleWidth = 180;
		const scaleHeight = 5;
		const scaleX = 10;

		// Green section (Excellent)
		pdf.setFillColor(46, 124, 43);
		pdf.rect(scaleX, yPosition, scaleWidth / 3, scaleHeight, 'F');

		// Yellow section (Good)
		pdf.setFillColor(201, 148, 0);
		pdf.rect(scaleX + scaleWidth / 3, yPosition, scaleWidth / 3, scaleHeight, 'F');

		// Red section (Needs Improvement)
		pdf.setFillColor(220, 53, 69);
		pdf.rect(scaleX + (2 * scaleWidth) / 3, yPosition, scaleWidth / 3, scaleHeight, 'F');

		// Add labels
		yPosition += scaleHeight + 5;
		pdf.text('Excellent (<24h)', scaleX, yPosition);
		pdf.text('Good (24-72h)', scaleX + scaleWidth / 3 + 5, yPosition);
		pdf.text('Needs Improvement (>72h)', scaleX + (2 * scaleWidth) / 3 + 5, yPosition);

		// Add marker for current performance
		const markerPosition = Math.min(Math.max((avgHours / 168) * scaleWidth, 0), scaleWidth);
		pdf.setFillColor(0, 0, 0);
		pdf.circle(scaleX + markerPosition, yPosition - scaleHeight - 3, 2, 'F');

		yPosition += 15;

		if (data.details && data.details.length > 0) {
			pdf.setFontSize(14);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Individual Request Details', 10, yPosition);
			yPosition += 10;

			// Add table header
			pdf.setFontSize(10);
			pdf.text('Request ID', 10, yPosition);
			pdf.text('Turnaround Hours', 80, yPosition);
			pdf.text('Turnaround Days', 130, yPosition);
			yPosition += 5;

			pdf.line(10, yPosition, 200, yPosition);
			yPosition += 5;

			pdf.setFont('helvetica', 'normal');
			data.details.forEach((detail: any) => {
				if (yPosition > 250) {
					pdf.addPage();
					this.addPdfHeader(pdf, 'approvalTurnaroundTime');
					yPosition = 40;

					// Repeat header
					pdf.setFontSize(10);
					pdf.setFont('helvetica', 'bold');
					pdf.text('Request ID', 10, yPosition);
					pdf.text('Turnaround Hours', 80, yPosition);
					pdf.text('Turnaround Days', 130, yPosition);
					yPosition += 5;

					pdf.line(10, yPosition, 200, yPosition);
					yPosition += 5;
					pdf.setFont('helvetica', 'normal');
				}

				pdf.text(`#${detail.id.slice(-8)}`, 10, yPosition);
				pdf.text(detail.turnaroundHours.toFixed(2), 80, yPosition);
				pdf.text((detail.turnaroundHours / 24).toFixed(2), 130, yPosition);
				yPosition += 5;
			});
		}

		return yPosition;
	}
}

class XlsxExporter {
	async export(data: any, reportType: ReportTypes, options?: ExportOptions): Promise<void> {
		const filename = options?.filename || this.generateFilename(reportType, 'xlsx');

		switch (reportType) {
			case 'fundRequestHistory':
				this.exportFundRequestHistory(data, filename);
				break;
			case 'expenseSummary':
				this.exportExpenseSummary(data, filename);
				break;
			case 'approvalTurnaroundTime':
				this.exportApprovalTurnaround(data, filename);
				break;
		}
	}

	private generateFilename(reportType: ReportTypes, extension: string): string {
		const reportNames = {
			fundRequestHistory: 'Fund_Request_History',
			expenseSummary: 'Expense_Summary',
			approvalTurnaroundTime: 'Approval_Turnaround_Time',
		};
		return `${reportNames[reportType]}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.${extension}`;
	}

	private exportFundRequestHistory(data: any, filename: string): void {
		const workbook = XLSX.utils.book_new();

		// Summary sheet
		const summaryData = [
			['Metric', 'Value'],
			['Total Projects', data.total],
			['Total Budget', data.histories.reduce((sum: number, h: any) => sum + h.budget, 0)],
			['Total Fund Requests', data.histories.reduce((sum: number, h: any) => sum + h.fundRequests.length, 0)],
			['Approved Projects', data.histories.filter((h: any) => h.status === 'approved').length],
		];
		const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

		// Projects sheet
		const projectsData = [
			['Project Title', 'Budget', 'Status', 'Created Date', 'Updated Date', 'Needs Attention', 'Fund Requests Count'],
		];
		data.histories.forEach((history: any) => {
			projectsData.push([
				history.title,
				history.budget,
				history.status,
				format(new Date(history.createdAt), 'yyyy-MM-dd'),
				format(new Date(history.updatedAt), 'yyyy-MM-dd'),
				history.needsAttention ? 'Yes' : 'No',
				history.fundRequests.length,
			]);
		});
		const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
		XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

		// Fund requests sheet
		const fundRequestsData = [
			['Project Title', 'Category', 'Amount', 'Status', 'Reference Number', 'Created Date', 'Release Date'],
		];
		data.histories.forEach((history: any) => {
			history.fundRequests.forEach((fr: any) => {
				fundRequestsData.push([
					history.title,
					fr.category,
					fr.amount,
					fr.status,
					fr.referenceNumber,
					format(new Date(fr.createdAt), 'yyyy-MM-dd'),
					fr.releaseDate ? format(new Date(fr.releaseDate), 'yyyy-MM-dd') : '',
				]);
			});
		});
		const fundRequestsSheet = XLSX.utils.aoa_to_sheet(fundRequestsData);
		XLSX.utils.book_append_sheet(workbook, fundRequestsSheet, 'Fund Requests');

		XLSX.writeFile(workbook, filename);
	}

	private exportExpenseSummary(data: any, filename: string): void {
		const workbook = XLSX.utils.book_new();

		const totalExpenses = data.reduce((sum: number, item: any) => sum + item.total, 0);

		// Summary sheet
		const summaryData = [
			['Metric', 'Value'],
			['Total Expenses', totalExpenses],
			['Total Requests', data.reduce((sum: number, item: any) => sum + item.count, 0)],
			['Categories', data.length],
		];
		const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

		// Detailed breakdown
		const detailData = [
			['Category', 'Total Amount', 'Percentage', 'Request Count', 'Pending', 'Approved', 'Rejected', 'Released'],
		];
		data.forEach((item: any) => {
			const percentage = ((item.total / totalExpenses) * 100).toFixed(2);
			detailData.push([
				item.category,
				item.total,
				`${percentage}%`,
				item.count,
				item.pending,
				item.approved,
				item.rejected,
				item.released,
			]);
		});
		const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
		XLSX.utils.book_append_sheet(workbook, detailSheet, 'Category Breakdown');

		XLSX.writeFile(workbook, filename);
	}

	private exportApprovalTurnaround(data: any, filename: string): void {
		const workbook = XLSX.utils.book_new();

		// Summary sheet
		const summaryData = [
			['Metric', 'Value'],
			['Average Turnaround Hours', data.averageTurnaroundHours.toFixed(4)],
			['Average Turnaround Days', (data.averageTurnaroundHours / 24).toFixed(2)],
			['Total Requests', data.totalRequests],
			[
				'Performance Rating',
				data.averageTurnaroundHours < 24
					? 'Excellent'
					: data.averageTurnaroundHours < 72
					? 'Good'
					: 'Needs Improvement',
			],
		];
		const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

		// Details sheet
		const detailsData = [['Request ID', 'Turnaround Hours', 'Turnaround Days']];
		data.details.forEach((detail: any) => {
			detailsData.push([detail.id, detail.turnaroundHours.toFixed(4), (detail.turnaroundHours / 24).toFixed(2)]);
		});
		const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
		XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Request Details');

		XLSX.writeFile(workbook, filename);
	}
}
