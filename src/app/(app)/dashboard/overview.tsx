"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/hooks/use-project";
import {
  formatCurrency,
  formatDate,
  getProposalStatusColor,
  getVolunteerRequestStatusColor,
} from "@/lib/utils";
import { Project, VolunteerRequest } from "@prisma/client";
import {
  BarChart2,
  Calendar,
  Clock,
  FileText,
  Target,
  Users,
  Eye,
} from "lucide-react";
import Link from "next/link";

export function Overview() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-white">
                  {data.totalProjects}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">
                  Available Budget
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-white">
                  {formatCurrency(data.availableBudget)}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500 dark:text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900 dark:to-purple-800 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                  Volunteers
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-white">
                  {data.volunteersCount}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500 dark:text-purple-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900 dark:to-orange-800 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-300">
                  Completed Projects
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-white">
                  {data.totalProjects > 0
                    ? Math.round(
                        (data.completedProjects / data.totalProjects) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <BarChart2 className="w-8 h-8 text-orange-500 dark:text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Proposals</CardTitle>
            <CardDescription>
              View and manage recent project proposals.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <RecentProjects projects={data.recentProjects} />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Analyze the budget distribution across projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <BudgetOverview budgetData={data.categoryMap} />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Volunteer Requests </CardTitle>
            <CardDescription>
              Track volunteer participation and engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <VolunteerRequests
              recentVolunteerRequests={data.recentVolunteerRequests}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VolunteerRequests({
  recentVolunteerRequests,
}: {
  recentVolunteerRequests: (VolunteerRequest & {
    title: string;
    participated: number;
  })[];
}) {
  if (!recentVolunteerRequests || recentVolunteerRequests.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No recent volunteer requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentVolunteerRequests.slice(0, 3).map((req) => (
        <Link
          key={req.id}
          href={`/project/participate/${req.id}`}
          className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm line-clamp-1">{req.title}</h4>
            <Badge
              className={`text-xs ${getVolunteerRequestStatusColor(
                req.status
              )}`}
            >
              {req.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {req.participated} / {req.participantLimit} joined
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(req.createdAt)}
              </span>
            </div>
            {req.participated < req.participantLimit && (
              <span className="flex items-center gap-1 text-orange-600">
                <Clock className="w-3 h-3" />
                Still recruiting
              </span>
            )}
          </div>
        </Link>
      ))}

      {recentVolunteerRequests.length > 3 && (
        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href="/volunteer/requests" className="block">
            <Eye className="w-4 h-4 mr-2" />
            View All ({recentVolunteerRequests.length})
          </Link>
        </Button>
      )}
    </div>
  );
}

function RecentProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No recent proposals</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.slice(0, 3).map((project) => (
        <Link
          key={project.id}
          href={`/project/${project.id}`}
          className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm line-clamp-1">
              {project.title}
            </h4>
            <Badge
              className={`text-xs ${getProposalStatusColor(project.status)}`}
            >
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                {formatCurrency(project.budget)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(project.from)}
              </span>
            </div>
            {project.needsAttention && (
              <span className="flex items-center gap-1 text-orange-600">
                <Clock className="w-3 h-3" />
                Attention
              </span>
            )}
          </div>
        </Link>
      ))}
      {projects.length > 3 && (
        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href="/project" className="block">
            <Eye className="w-4 h-4 mr-2" />
            View All ({projects.length})
          </Link>
        </Button>
      )}
    </div>
  );
}

function BudgetOverview({
  budgetData,
}: {
  budgetData: {
    name: string;
    spent: number;
    allocated: number;
    percentage: number;
  }[];
}) {
  return (
    <div className="space-y-6">
      {budgetData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories overview available
        </p>
      ) : (
        budgetData.map((category) => {
          return (
            <div key={category.name} className="space-y-1">
              <p className="text-sm font-medium">{category.name}</p>
              <Progress value={category.percentage} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>
                  {formatCurrency(category.spent)} /{" "}
                  {formatCurrency(category.allocated)}
                </span>
                <span>{category.percentage}% Used</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects Card Skeleton */}
        <Card className="bg-gradient-to-r from-blue-50/40 to-blue-100/40 border-blue-200/40 dark:from-blue-900/40 dark:to-blue-800/40 dark:border-blue-700/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Available Budget Card Skeleton */}
        <Card className="bg-gradient-to-r from-green-50/40 to-green-100/40 border-green-200/40 dark:from-green-900/40 dark:to-green-800/40 dark:border-green-700/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Volunteers Card Skeleton */}
        <Card className="bg-gradient-to-r from-purple-50/40 to-purple-100/40 border-purple-200/40 dark:from-purple-900/40 dark:to-purple-800/40 dark:border-purple-700/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects Card Skeleton */}
        <Card className="bg-gradient-to-r from-orange-50/40 to-orange-100/40 border-orange-200/40 dark:from-orange-900/40 dark:to-orange-800/40 dark:border-orange-700/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent Proposals Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Activity Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
