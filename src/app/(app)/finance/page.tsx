'use client';

import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { SectionWrapper } from '@/components/section-wrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	CirclePlusIcon,
	ClipboardListIcon,
	FileBarChartIcon,
	LayoutDashboardIcon,
	LineChartIcon,
	BanknoteIcon,
} from 'lucide-react';
import Link from 'next/link';
import { DataTable } from './_components/data-table';
import { columns } from './_components/columns';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { FinancialOverview } from './_components/financial-overview';
import { DisburseDataTable } from './_components/disburse-data-table';
import { disburseColumns } from './_components/disburse-columns';
import { ButtonGuard } from '@/components/button-guard';
import { AccessGuard } from '@/components/access-guard';
import { Report } from './_components/report';
import { FinanceForecast } from './_components/finance-forecast';

export default function Page() {
	return (
		<AccessGuard page="fundRequest">
			<PageHeader>
				<div>
					<PageHeaderHeading>Financial Disbursement</PageHeaderHeading>
					<PageHeaderDescription>Manage fund request and track budget allocation</PageHeaderDescription>
				</div>
				<ButtonGuard name="fundRequest" actions={['create']}>
					<PageActions>
						<Button asChild>
							<Link href="/finance/new">
								<CirclePlusIcon className="w-4 h-4 mr-2" />
								Add new Fund Request
							</Link>
						</Button>
					</PageActions>
				</ButtonGuard>
			</PageHeader>
			<Tabs defaultValue="overview" className="gap-0">
				<SectionWrapper>
					<TabsList>
						<TabsTrigger value="overview">
							<LayoutDashboardIcon className="h-4 w-4 mr-2" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="request">
							<ClipboardListIcon className="h-4 w-4 mr-2" />
							My Requests
						</TabsTrigger>
						<ButtonGuard name="fundRequest" actions={['disburse']}>
							<TabsTrigger value="disbursement">
								<BanknoteIcon className="h-4 w-4 mr-2" />
								Disbursement
							</TabsTrigger>
						</ButtonGuard>
						<TabsTrigger value="forecast">
							<LineChartIcon className="h-4 w-4 mr-2" />
							Forecast
						</TabsTrigger>
						<TabsTrigger value="report">
							<FileBarChartIcon className="h-4 w-4 mr-2" />
							Reports
						</TabsTrigger>
					</TabsList>
				</SectionWrapper>
				<SectionWrapper>
					<TabsContent value="overview">
						<div className="flex flex-col gap-4">
							<Card>
								<CardHeader>
									<CardTitle>Financial Overview</CardTitle>
									<CardDescription>Track budget allocation and expenditure</CardDescription>
								</CardHeader>
								<CardContent>
									<FinancialOverview />
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Recent Fund Requests</CardTitle>
									<CardDescription>Latest fund requests across all projects</CardDescription>
								</CardHeader>
								<CardContent>
									<DataTable columns={columns} recent />
								</CardContent>
							</Card>
						</div>
					</TabsContent>
					<TabsContent value="request">
						<Card>
							<CardHeader>
								<CardTitle>My Fund Requests</CardTitle>
								<CardDescription>Track your fund requests</CardDescription>
							</CardHeader>
							<CardContent>
								<DataTable columns={columns} userOnly />
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="disbursement">
						<Card>
							<CardHeader>
								<CardTitle>Disbursement</CardTitle>
								<CardDescription>Track your disbursements</CardDescription>
							</CardHeader>
							<CardContent>
								<DisburseDataTable columns={disburseColumns} />
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="forecast">
						<Card>
							<CardHeader>
								<CardTitle>Financial Forecasting & Oversight</CardTitle>
								<CardDescription>Predictive analytics based on historical spending patterns</CardDescription>
							</CardHeader>
							<CardContent>
								<FinanceForecast />
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="report">
						<Card>
							<CardHeader>
								<CardTitle>Financial Reports</CardTitle>
								<CardDescription>Generate and export financial reports for analysis</CardDescription>
							</CardHeader>
							<CardContent>
								<Report />
							</CardContent>
						</Card>
					</TabsContent>
				</SectionWrapper>
			</Tabs>
		</AccessGuard>
	);
}
